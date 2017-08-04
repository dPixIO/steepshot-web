import steem from 'steem';
import constants from '../common/constants';
import Promise from 'bluebird';
import { getStore } from '../store/configureStore';

const getUserName = () => {
    return getStore().getState().auth.user
}

class Steem {
    comment(wif, parentAuthor, parentPermlink, author, body, tags, resolve) {
        const permlink = this._getPermLink();

        const operation = [constants.OPERATIONS.COMMENT, {
            parent_author: parentAuthor,
            parent_permlink: parentPermlink,
            author: author,
            permlink: permlink + '-post',
            title: "",
            body: body,
            json_metadata: JSON.stringify(this._createJsonMetadata(tags))
        }];

        const callback = (err, result) => {
            if(err) {
                console.log(err);
                return resolve(null);
            } else {
                return resolve({
                    type: 'UPDATE_COMMENTS'
                });
            }
        }

        this.handleBroadcastMessages(operation, [], wif, callback)
    }

    vote(wif, username, author, url, isUpVote) {
        steem.api.getContentAsync(author, url)
          .then((result) => {
            steem.broadcast.vote(wif, username, result.author, result.permlink, isUpVote ? 10000 : -1000, () => { return; });
          });
    }

    upVote() {
        //@TODO: Implement steem logic
    }

    downVote() {
        //@TODO: Implement steem logic
    }

    _sendBroadCasts(operations, postingWif) {
        let tx = steem.broadcast.sendAsync({ operations, extensions: [] }, { posting: postingWif });
    }

    _getBeneficiaries(permlink) {
        return [
            constants.OPERATIONS.COMMENT_OPTIONS, {
            author: getUserName(),
            permlink,
            max_accepted_payout: constants.STEEM_PATLOAD.MAX_ACCEPTED_PAYOUT,
            percent_steem_dollars: constants.STEEM_PATLOAD.PERCENT_STEMM_DOLLARS,
            allow_votes: true,
            allow_curation_rewards: true,
            extensions: [
                [0, {
                    beneficiaries: [
                        { 
                            account: 'good-karma', 
                            weight: 2000 
                        },
                        { 
                            account: 'null', 
                            weight: 5000 
                        }
                    ]
                }]
            ]
        }];
    }

    /** Follow an user */
    followUser(wif, follower, following) {
        const json = JSON.stringify(
            [constants.OPERATIONS.FOLLOW, {
            follower: follower,
            following: following,
            what: ['blog']
            }]
        );

        steem.broadcast.customJson(
            wif,
            [], // Required_auths
            [follower], // Required Posting Auths
            'follow', // Id
            json, //
            (err, result) => {
                if (err) {
                    console.log(err);
                }
            }
        );
    }

    /** Unfollow an user */
    unfollowUser(wif, follower, following) {
        const json = JSON.stringify(
            [constants.OPERATIONS.FOLLOW, {
                follower: follower,
                following: following,
                what: []
            }]
        );

        steem.broadcast.customJson(
            postingWif,
            [], // Required_auths
            [follower], // Required Posting Auths
            'follow', // Id
            json, //
            (err, result) => {
                if (err) {
                    console.log(err);
                }
            }
        );
    }

    /** Broadcast a post */
    createPost(wif, tags, author, title, file) {
        const jsonMetadata = this._createJsonMetadata(tags);
        const permlink = this._getPermLink();

        const operation = [constants.OPERATIONS.COMMENT, {
            parent_author: "",
            parent_permlink: permlink + '-post',
            author: author,
            permlink: permlink + '-post',
            title: title,
            body: file || "test",
            json_metadata: JSON.stringify(jsonMetadata)
        }];

        this.handleBroadcastMessages(operation, [], wif);
    }

    handleBroadcastMessages(message, extetion, postingKey, callback) {
        this._preCompileTransaction(message, postingKey)
        .then((compiledTransaction) => {
            //@TODO: Update message body with new image link

            const operations = [message, this._getBeneficiaries(message[1].permlink)];

            steem.broadcast.sendAsync(
                { operations, extensions: [] },
                { posting: postingKey }
            );

            callback();
        });
    }

    _preCompileTransaction(message, postingKey) {
        return steem.broadcast._prepareTransaction({
            extensions: [],
            operations: [message],
        })
        .then((transaction) => {
            return Promise.join(
                transaction,
                steem.auth.signTransaction(transaction, [postingKey])
            )
        })
        .spread((transaction, signedTransaction) => {
            //Send to backend validate item
            return signedTransaction;
        });
    }

    _createJsonMetadata(tags) {
        return {
            tags: tags,
            app: 'steepshot/0.0.5' //@TODO get metadata from Backend
        }
    }

    _getPermLink() {
        return new Date().toISOString().replace(/[^a-zA-Z0-9]+/g, '').toLowerCase();
    }
}

export default new Steem();