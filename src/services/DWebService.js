import dpay from 'dpayjs';
import Constants from '../common/constants';
import PostService from './PostService';
import AuthService from './AuthService';
import dpay from 'dpayjs';

class DWebService {

	init() {
		dpay.config.set('websocket', Constants.BLOCKCHAIN.dpay.CONNECTION_SERVERS[0]);
		dpay.config.set('address_prefix', Constants.BLOCKCHAIN.dpay.PREFIX);
		dpay.config.set('chain_id', Constants.BLOCKCHAIN.dpay.CHAIN_ID);
	}

	addCommentToBlockchain(commentOperation) {
		return processResponse(callback => {
			let beneficiaries = this.getBeneficiaries(commentOperation[1].permlink, [{
				account: 'dpix',
				weight: 1000
			}]);
			const operations = [commentOperation, beneficiaries];
			dpay.broadcast.sendAsync(
				{operations, extensions: []},
				{posting: AuthService.getPostingKey()},
				callback
			);
		})
	}

	changeVoteInBlockchain(postAuthor, permlink, power) {
		return processResponse(callback => {
			dpay.broadcast.vote(AuthService.getPostingKey(), AuthService.getUsername(), postAuthor, permlink, power, callback);
		})
	}

	deletePostFromBlockchain(permlink) {
		return processResponse(callback => {
			dpay.broadcast.deleteComment(AuthService.getPostingKey(), AuthService.getUsername(), permlink, callback);
		})
	}

	changeFollowInBlockchain(jsonData) {
		return processResponse(callback => {
			dpay.broadcast.customJson(AuthService.getPostingKey(), [], [AuthService.getUsername()], 'follow', jsonData,
				callback
			);
		})
	}

	sendTransferTroughBlockchain(transferInfo) {
		return processResponse(callback => {
			dpay.broadcast.transfer(transferInfo.wif, AuthService.getUsername(), transferInfo.recipient, transferInfo.amount,
				transferInfo.memo, callback);
		})
	}

	addPostDataToBlockchain(operations) {
		return processResponse(callback => {
			dpay.broadcast.sendAsync(
				{operations, extensions: []},
				{posting: AuthService.getPostingKey()}, callback
			);
		})
	}

	getAccounts(username) {
		return processResponse(callback => {
			return dpay.api.getAccounts([username], callback);
		})
	}

	wifIsValid(postingKey, pubWif) {
		return Promise.resolve(dpay.auth.wifIsValid(postingKey, pubWif));
	}

	getValidTransaction() {
		const operation = [Constants.OPERATIONS.COMMENT, {
			parent_author: '',
			parent_permlink: '',
			author: AuthService.getUsername(),
			permlink: PostService.createPostPermlink('dpix'),
			title: 'dpix',
			description: '',
			body: 'dpix',
			json_metadata: {
				tags: ['dpix'],
				app: 'dpix'
			}
		}];
		return processResponse(() => {
			return dpay.broadcast._prepareTransaction({
				extensions: [],
				operations: [operation],
			})
		})
			.then(transaction => {
				return processResponse(() => {
					return dpay.auth.signTransaction(transaction, [AuthService.getPostingKey()])
				})
			})
			.catch(error => {
				return Promise.reject(error);
			});
	}

	getBeneficiaries(permlink, beneficiaries) {
		let beneficiariesObject = {
			author: AuthService.getUsername(),
			permlink: permlink,
			max_accepted_payout: Constants.SERVICES.dpay.MAX_ACCEPTED_PAYOUT,
			percent_dpay_dollars: Constants.SERVICES.dpay.PERCENT_DPAY_DOLLARS,
			allow_votes: true,
			allow_curation_rewards: true,
			extensions: [[0, {beneficiaries: beneficiaries}]]
		};

		return [Constants.OPERATIONS.COMMENT_OPTIONS, beneficiariesObject];
	}

	getTransactionHistory(username, from, limit) {
		if (from !== -1 && from < limit) {
			limit = from
		}
		return processResponse(callback => {
			dpay.api.getAccountHistory(username, from, limit, callback);
		})
	}

	powerUp(activeKey, amount) {
		const username = AuthService.getUsername();
		return processResponse(callback => {
			dpay.broadcast.transferToVesting(activeKey, username, username, amount, callback);
		})
	}

	powerDown(activeKey, amount) {
		return processResponse(callback => {
			dpay.broadcast.withdrawVesting(activeKey, AuthService.getUsername(), amount, callback);
		})
	}
}

export default DWebService;

function processResponse(sendingFunction) {
	return new Promise((resolve, reject) => {
		const callback = (err, success) => {
			if (err) {
				reject(err);
			} else {
				resolve(success);
			}
		};
		const responseBlockchain = sendingFunction(callback);
		if (typeof(responseBlockchain) === 'object') {
			if (typeof(responseBlockchain.then) === 'function') {
				responseBlockchain
					.then(response => {
						if (!response.error) {
							resolve(response);
						} else {
							reject(response.error);
						}
					})
					.catch(error => {
						reject(error);
					})
			} else {
				resolve(responseBlockchain);
			}
		}
	})
}
