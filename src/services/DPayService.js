import dpay from 'dpayjs';
import Constants from '../common/constants';
import PostService from './PostService';
import AuthService from './AuthService';
import DPayNodeService from './DPayNodeService';

let dynamicProps = [];
dpay.api.getDynamicGlobalProperties((err, result) => {
	if (result) {
		dynamicProps = result;
	}
});

class DPayService {

	init() {
		DPayNodeService.initConfig();
	}

	addCommentToBlockchain(commentOperation) {
		return processRequest(callback => {
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
		return processRequest(callback => {
			dpay.broadcast.vote(AuthService.getPostingKey(), AuthService.getUsername(), postAuthor, permlink, power, callback);
		})
	}

	deletePostFromBlockchain(permlink) {
		return processRequest(callback => {
			dpay.broadcast.deleteComment(AuthService.getPostingKey(), AuthService.getUsername(), permlink, callback);
		})
	}

	changeFollowInBlockchain(jsonData) {
		return processRequest(callback => {
			dpay.broadcast.customJson(AuthService.getPostingKey(), [], [AuthService.getUsername()], 'follow', jsonData,
				callback
			);
		})
	}

	addPostDataToBlockchain(operations) {
		return processRequest(callback => {
			dpay.broadcast.sendAsync(
				{operations, extensions: []},
				{posting: AuthService.getPostingKey()},
				callback
			);
		})
	}

	sendTransferTroughBlockchain(transferInfo) {
		return processRequest(callback => {
			dpay.broadcast.transfer(transferInfo.wif, AuthService.getUsername(), transferInfo.recipient, transferInfo.amount,
				transferInfo.memo, callback);
		});
	}

	getAccounts(username) {
		return processRequest(callback => {
			dpay.api.getAccounts([username], callback);
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
		return processRequest(() => {
			return dpay.broadcast._prepareTransaction({
				extensions: [],
				operations: [operation],
			})
		})
			.then(transaction => {
				return processRequest(() => {
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

  claimRewards(dpay_tokens, bbd_tokens, dpay_power) {
    return processRequest(callback => {
      dpay.broadcast.claimRewardBalance(AuthService.getPostingKey(), AuthService.getUsername(), dpay_tokens,
				bbd_tokens, dpay_power, callback);
    })
  }

	static vestsToBp(vesting_shares) {
		vesting_shares = vesting_shares.toString();
		const vests = parseFloat(vesting_shares.split(' ')[0]);
		const total_vests = parseFloat(dynamicProps['total_vesting_shares'].split(' ')[0]);
		const total_vest_dpay = parseFloat(dynamicProps['total_vesting_fund_dpay'].split(' ')[0]);
		return (total_vest_dpay * (vests / total_vests)).toFixed(3);
	}
}

export default DPayService;

function processRequest(sendRequestFunction) {
	return new Promise((resolve, reject) => {
		const dpayNodeService = new DPayNodeService();
		checkingNode(resolve, reject, sendRequestFunction, dpayNodeService);
	});
}

function checkingNode(resolve, reject, sendRequestFunction, dpayNodeService) {
	processResponse(callback => {
		return sendRequestFunction(callback)
	})
		.then(response => {
			resolve(response);
		})
		.catch(error => {
			if (dpayNodeService.isMaxCountRequests()) {
				reject(error);
			} else {
				dpayNodeService.setNextNode();
				checkingNode(resolve, reject, sendRequestFunction, dpayNodeService);
			}
		})
}

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
