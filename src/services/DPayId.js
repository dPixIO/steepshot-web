import dpid from 'dpayid';
import AuthService from './AuthService';
import DPayService from './DPayService';

const location = window.location;
const callbackURL = `${location.origin}/dPayId`;
const api = dpid.Initialize({
  app: 'dev.dpix.io',
  callbackURL,
  scope: ['login', 'offline', 'vote', 'comment', 'delete_comment', 'comment_options', 'custom_json', 'claim_reward_balance']
});

class DPayId {

  static getLoginUrl() {
    return api.getLoginURL();
  }

  init() {
    api.setAccessToken(AuthService.getAccessToken());
  }

  addCommentToBlockchain(commentOperation) {
    let beneficiaries = this.getBeneficiaries(commentOperation[1].permlink, [{
      account: 'dpix',
      weight: 1000
    }]);
    const operations = [commentOperation, beneficiaries];
    return api.broadcast(operations).then(response => Promise.resolve(response.result));
  }

  changeVoteInBlockchain(postAuthor, permlink, power) {
    return api.vote(AuthService.getUsername(), postAuthor, permlink, power);
  }

  deletePostFromBlockchain(permlink) {
    const params = {
      author: AuthService.getUsername(),
      permlink
    };
    return api.broadcast([['delete_comment', params]]);
  }

  changeFollowInBlockchain(jsonData) {
    const params = {
      required_auths: [],
      required_posting_auths: [AuthService.getUsername()],
      id: 'follow',
      json: jsonData
    };
    return api.broadcast([['custom_json', params]]);
  }

  addPostDataToBlockchain(operations) {
    return api.broadcast(operations).then(response => Promise.resolve(response.result));
  }

  sendTransferTroughBlockchain(transferInfo) {
    const transferLink = api.sign('transfer', transferInfo, location.href);
    location.assign(transferLink);
  }

  powerUp(powerUpInfo) {
    const powerUpLink = api.sign('transfer_to_vesting', powerUpInfo, location.href);
    location.assign(powerUpLink);
  }

  powerDown(powerDownInfo) {
    const powerDownLink = api.sign('withdraw_vesting', powerDownInfo, location.href);
    location.assign(powerDownLink);
  }

  claimRewards(dpay_tokens, bbd_tokens, dpay_power) {
    return api.claimRewardBalance(AuthService.getUsername(), dpay_tokens, bbd_tokens, dpay_power)
      .then(() => {return Promise.resolve()});
  }

  getAccounts(username) {
    return new DPayService().getAccounts(username);
  }

  wifIsValid() {
    throw new Error('Only for base authorization.');
  }

  getValidTransaction() {
    throw new Error('Only for base authorization.');
  }

  getBeneficiaries(permlink, beneficiaries) {
    return new DPayService().getBeneficiaries(permlink, beneficiaries);
  }

  getTransactionHistory(username, from, limit) {
    return new DPayService().getTransactionHistory(username, from, limit);
  }
}

export default DPayId;
