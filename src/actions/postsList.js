import {getStore} from '../store/configureStore';
import Constants from '../common/constants';
import {serverErrorsList} from '../utils/serverErrorsList';
import PostService from '../services/PostService';

export function initPostsList(options) {
	return {
		type: 'INIT_POSTS_LIST',
		options
	};
}

function getPostsListRequest(point) {
	return {
		type: 'GET_POSTS_LIST_REQUEST',
		point: point
	};
}

function getPostsListSuccess(pointOptions, posts) {
	return {
		type: 'GET_POSTS_LIST_SUCCESS',
		options: pointOptions,
		posts
	};
}

function getPostsListError(point, error) {
	return {
		type: 'GET_POSTS_LIST_ERROR',
		point,
		error
	};
}

export function getPostsList(point) {
	const LIMIT = 16;
	const state = getStore().getState();
	const statePostsList = state.postsList[point];
	if (statePostsList.loading) {
		return {
			type: 'EMPTY_GET_POSTS'
		}
	}
	if (!statePostsList.hasMore) {
		return {
			type: 'ALL_POSTS_LOADED',
			point
		}
	}
	return dispatch => {
		dispatch(getPostsListRequest(point));
		const settings = state.settings;

		PostService.getPostsList(point, statePostsList.offset, settings.show_nsfw, settings.show_low_rated, LIMIT,
			statePostsList.options)
			.then(response => {
				//TODO удалить когда будут реальные видео в ленте
				/*if (response.results[2]) {
					const media = response.results[2].media[0];
					media.url = 'http://dpix.org/api/v1/image/1440930c-6a1c-4fae-bc63-4646495cc96a.mp4';
					if (media['thumbnails'] && media['thumbnails'][1024]) {
						media['thumbnails'][1024] = 'http://dpix.org/api/v1/image/1440930c-6a1c-4fae-bc63-4646495cc96a.mp4';
					}
				}*/
				let newPosts = response.results;
				let hasMore = newPosts.length === LIMIT;
				newPosts = removeDuplicate(newPosts);
				newPosts = removeOldDuplicate(statePostsList.posts, newPosts);
				newPosts = removeDeleted(response, newPosts);
				let notDeletedPosts = newPosts[0];
				response = newPosts[1];
				let posts = notDeletedPosts.map((post) => {
					return post.url
				});
				if (statePostsList.maxPosts <= posts.length + statePostsList.posts.length) {
					posts = posts.slice(0, statePostsList.maxPosts - statePostsList.posts.length);
					hasMore = false;
				}
				let pointOptions = {
					point,
					posts,
					offset: response.offset,
					hasMore: hasMore,
					length: posts.length,
				};

				let postsObject = {};
				let postsLength = notDeletedPosts.length;
				for (let i = 0; i < postsLength; i++) {
					let daysBeforeCashout = (new Date(notDeletedPosts[i]['cashout_time']).getTime() - new Date().getTime())
						/ Constants.MILLISECONDS_IN_DAY;
					let post = Object.assign({}, notDeletedPosts[i], {
						flagLoading: false,
						voteLoading: false,
						postDeleting: false,
						postAge: (Constants.CASHOUT_PERIOD - daysBeforeCashout).toFixed(1) / 1,
						isVideo: !!notDeletedPosts[i].media[0].url.match(/mp4$/i),
						isGif: !!notDeletedPosts[i].media[0].url.match(/gif$/i),
						playing: false
					});
					post.tags = (post.tags instanceof Array)
						? post.tags
						: post.tags.split(',');
					postsObject[notDeletedPosts[i].url] = post;
				}
				notDeletedPosts = postsObject;
				dispatch(getPostsListSuccess(pointOptions, notDeletedPosts));
			})
			.catch(error => {
				let checkedError = serverErrorsList(error.status);
				dispatch(getPostsListError(point, checkedError));
			});
	};
}

function removeOldDuplicate(posts, newPosts) {
	if (posts.length) {
		for (let i = 0; i < newPosts.length; i++) {
			for (let j = 0; j < posts.length; j++) {
				if (posts[j] === newPosts[i].url) {
					newPosts.splice(i, 1);
					i--;
				}
			}
		}
	}
	return newPosts;
}

function removeDuplicate(posts) {
	if (posts.length > 1) {
		for (let i = 0; i < posts.length - 1; i++) {
			for (let j = i + 1; j < posts.length; j++) {
				if (posts[j].url === posts[i].url) {
					posts.splice(j, 1);
					j--;
				}
			}
		}
	}
	return posts;
}

function removeDeleted(response, posts) {
	if (posts.length) {
		for (let i = 0; i < posts.length; i++) {
			if (posts[i].body === Constants.DELETE.PUTATIVE_DELETED_POST) {
				response.offset = posts[i - 1].url;
				posts.splice(i, 1);
				i--;
			}
		}
	}
	return [posts, response];
}
