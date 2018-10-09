import Constants from '../common/constants';
import {serverErrorsList} from './serverErrorsList';

export function blockchainErrorsList(error) {
	console.log(error);
	if (error.message === 'dpayid error') {
		return 'DPayId error.'
	}
	if (!error.data) {
		if (error.actual === 128 || error.message === Constants.NON_BASE58_CHARACTER) {
			return Constants.ERROR_MESSAGES.INVALID_ACTIVE_KEY;
		}
		if (typeof error === 'string') {
			return error;
		}
		if (error.status && error.statusText) {
			return serverErrorsList(error.status);
		}
	}
	if (error.data || error.payload) {
		let newError, format = '';
		if (error.data && error.data.stack && error.data.stack[0].format) {
			format = ': ' + error.data.stack[0].format;
			newError = `${error.data.code} ${error.data.name}: ${error.data.message}${format}`
		}
		if (error.payload && error.payload.error.data.stack && error.payload.error.data.stack[0].format) {
			let dwebErrorsData = error.payload.error.data;
			format = ': ' + dwebErrorsData.stack[0].format;
			newError = `${dwebErrorsData.code} ${dwebErrorsData.name}: ${dwebErrorsData.message}${format}`;
		}
		let errorsList = [
			{
				error: ['4100000 plugin_exception: plugin exception: Account: ${account} bandwidth limit exeeded. Please wait to ' + // eslint-disable-line
				'transact or power up BEX.', '4100000 plugin_exception: plugin exception: Account: ${account} bandwidth limit ' + // eslint-disable-line
				'exceeded. Please wait to transact or power up BEX.'],
				notificationText: 'Your transaction cannot be completed. BEX Power of your account is too low. For more ' +
				'information click <a href="https://dpix.io/faq#not-able-to-post" target="_blank">here</a>.'
			},
			{
				error: ['10 assert_exception: Assert Exception: elapsed_seconds >= DPAY_MIN_VOTE_INTERVAL_SEC: Can only vote ' +
				'once every 3 seconds.', '10 assert_exception: Assert Exception: elapsed_seconds >= DPAY_MIN_VOTE_INTERVAL_SEC:' +
				' Can only vote once every 3 seconds.'],
				notificationText: 'Can only vote once every 3 seconds.'
			},
			{
				error: ['10 assert_exception: Assert Exception: itr->num_changes < DPAY_MAX_VOTE_CHANGES: Voter has used the ' +
				'maximum number of vote changes on this comment.', '10 assert_exception: Assert Exception: itr->num_changes < ' +
				'DPAY_MAX_VOTE_CHANGES: Voter has used the maximum number of vote changes on this comment.'],
				notificationText: 'Sorry, you had used the maximum number of vote changes.'
			},
			{
				error: ['10 assert_exception: Assert Exception: abs_rshares > DPAY_VOTE_DUST_THRESHOLD || o.weight == 0: ' +
				'Voting weight is too small, please accumulate more voting power or BEX power.', '10 assert_exception: Assert ' +
				'Exception: abs_rshares > 30000000 || o.weight == 0: Voting weight is too small, please accumulate more voting ' +
				'power or BEX power.', '10 assert_exception: Assert Exception: info->abs_rshares > DPAY_VOTE_DUST_THRESHOLD || ' +
				'vote_weight == 0: Voting weight is too small, please accumulate more voting power or BEX power.'],
				notificationText: 'You cannot vote this way because you haven’t got enough BEX Power. For more information ' +
				'click <a href="https://dpix.io/faq#not-able-to-post" target="_blank">here</a>.'
			},
			{
				error: ['10 assert_exception: Assert Exception: (now - auth.last_post) > DPAY_MIN_REPLY_INTERVAL: You may only ' +
				'comment once every 20 seconds.', '10 assert_exception: Assert Exception: (now - auth.last_post) > ' +
				'DPAY_MIN_REPLY_INTERVAL: You may only comment once every 20 seconds.'],
				notificationText: 'You may only comment once every 20 seconds.'
			},
			{
				error: ['10 assert_exception: Assert Exception: itr->vote_percent != o.weight: You have already voted in a similar way.',
					'10 assert_exception: Assert Exception: vote.vote_percent != o.weight: You have already voted in a similar way.',
					'10 assert_exception: Assert Exception: vote.num_changes < DPAY_MAX_VOTE_CHANGES: Voter has used the maximum ' +
					'number of vote changes on this comment.'],
				notificationText: 'You\'ve already voted in a similar way. Please wait for synchronisation with blockchain.'
			},
			{
				error: '10 assert_exception: Assert Exception: _db.head_block_time() < comment.cashout_time - DPAY_UPVOTE_LOCKOUT_HF17:' +
				' Cannot increase payout within last twelve hours before payout.',
				notificationText: 'Cannot increase payout within last twelve hours before payout.'
			},
			{
				error: '3010000 tx_missing_active_auth: missing required active authority: Missing Active Authority ${id}', // eslint-disable-line
				notificationText: 'It\'s wrong key. Check it and try again.'
			},
			{
				error: '10 assert_exception: Assert Exception: equal(com.parent_permlink, o.parent_permlink): The permlink of a ' +
				'comment cannot change.', notificationText: 'The permlink of comment can\'t change.'
			},
			{
				error: '10 assert_exception: Assert Exception: ( now - auth.last_root_post ) > DPAY_MIN_ROOT_COMMENT_INTERVAL: ' +
				'You may only post once every 5 minutes.',
				notificationText: 'You can only create posts 5 minutes after the previous one.'
			},
      {
        error: '10 assert_exception: Assert Exception: is_valid_account_name( name ): Account name ${n} is invalid', // eslint-disable-line
        notificationText: 'There\'s no such user you want to transfer to.'
      },
			{
				error: '10 assert_exception: Assert Exception: _db.get_balance( o.from, o.amount.symbol ) >= o.amount: Account' +
				' does not have sufficient funds for transfer.',
				notificationText: Constants.ERROR_MESSAGES.NOT_ENOUGH_TOKENS
			},
			{
				error: '10 assert_exception: Assert Exception: _db.get_balance( from_account, o.amount.symbol) >= o.amount: ' +
				'Account does not have sufficient liquid amount for transfer.',
				notificationText: Constants.ERROR_MESSAGES.NOT_ENOUGH_TOKENS
			},
			{
				error: '10 assert_exception: Assert Exception: account.vesting_shares - account.delegated_vesting_shares >= ' +
				'o.vesting_shares: Account does not have sufficient BEX Power for withdraw.',
				notificationText: Constants.ERROR_MESSAGES.NOT_ENOUGH_TOKENS
			},
			{
				error: '13 N5boost16exception_detail10clone_implINS0_19error_info_injectorISt12out_of_rangeEEEE: unknown key: ${what}: ', // eslint-disable-line
				notificationText: Constants.ERROR_MESSAGES.USER_NOT_FOUND
			}
		];
		for (let i = 0; i < errorsList.length; i++) {
			if (Array.isArray(errorsList[i].error)) {
				let errorArr = errorsList[i].error;
				for (let j = 0; j < errorArr.length; j++) {
					if (errorArr[j] === newError) {
						return errorsList[i].notificationText;
					}
				}
			}
			if (errorsList[i].error === newError) {
				return errorsList[i].notificationText;
			}
		}
	}
	return Constants.OOOPS_SOMETHING_WRONG;
}
