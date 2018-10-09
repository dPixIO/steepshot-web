import {getStore} from '../store/configureStore';
import {actionLock, actionUnlock} from './session';
import WalletService from '../services/WalletService';
import storage from '../utils/Storage';
import {hideBodyLoader, showBodyLoader} from './bodyLoader';
import {closeModal} from './modal';
import {pushErrorMessage, pushMessage} from './pushMessage';
import Constants from '../common/constants';
import {inputError, stopTransferWithError} from './transfer';
import ChainService from '../services/ChainService';
import AuthService from '../services/AuthService';
import DPayService from '../services/DPayService';

function addDataToWallet(data) {
	return {
		type: 'ADD_DATA_TO_WALLET',
		data
	}
}

function updateAccountBalance() {
	return dispatch => {
		ChainService.getAccounts(AuthService.getUsername())
			.then(response => {
				const data = response[0];
				dispatch({
					type: 'UPDATE_ACCOUNT_BALANCE',
					newBalance: {
						balance: parseFloat(data.balance.split(' ')[0]),
						bbd_balance: parseFloat(data.bbd_balance.split(' ')[0]),
						total_dpay_power_dpay: DPayService.vestsToBp(data.vesting_shares),
						total_dpay_power_vests: parseFloat(data.vesting_shares.split(' ')[0])
					}
				})
			})
			.catch(error => {
				dispatch({
					type: 'UPDATE_ACCOUNT_ERROR',
					error
				})
			})
	}
}

export function getAccountsSelectiveData() {
  return dispatch => {
    if (global.isServerSide) {
      return;
    }
    ChainService.getAccounts(AuthService.getUsername())
      .then(response => {
        const data = response[0];
        const bbdRewards = parseFloat(data['reward_bbd_balance'].split(' ')[0]);
        const dpayRewards = parseFloat(data['reward_dpay_balance'].split(' ')[0]);
        const dpayPowerRewards = parseFloat(data['reward_vesting_dpay'].split(' ')[0]);
        const dpayPowerRewardsInVests = parseFloat(data['reward_vesting_balance'].split(' ')[0]);
        let noRewards = true;
        if (bbdRewards || dpayRewards || dpayPowerRewards) {
        	noRewards = false;
				}
        const selectiveData = {
          noRewards,
          next_power_down: data['next_vesting_withdrawal'] === '1969-12-31T23:59:59' ? '' : data['next_vesting_withdrawal'],
					to_withdraw: data['to_withdraw'],
					withdrawn: data['withdrawn'],
          bbd_rewards: bbdRewards,
          dpay_rewards: dpayRewards,
          dpay_power_rewards: dpayPowerRewards,
          dpay_power_rewards_in_vests: dpayPowerRewardsInVests,
					sp_received_by_delegation: parseFloat(DPayService.vestsToBp(data['received_vesting_shares'])),
					sp_delegated_to_someone: parseFloat(DPayService.vestsToBp(data['delegated_vesting_shares']))
        };
        dispatch(addDataToWallet(selectiveData));
      })
      .catch(error => {
        dispatch({
          type: 'GET_ACCOUNTS_SELECTIVE_DATA_ERROR',
          error
        })
      });
  }
}

export function claimAccountRewards(liquid_tokens, not_liquid_tokens, power_tokens) {
	return dispatch => {
    dispatch(actionLock());
    dispatch(showBodyLoader());
		ChainService.claimRewards(liquid_tokens || '0.000 BEX', not_liquid_tokens || '0.000 BBD',
			power_tokens || '0.000000 VESTS')
			.then(() => {
        dispatch(actionUnlock());
        dispatch(hideBodyLoader());
				dispatch(pushMessage(Constants.WALLET.CLAIM_REWARD_SUCCESSFULLY));
        dispatch(addDataToWallet({noRewards: true}));
        dispatch(updateAccountBalance());
			})
			.catch(error => {
				dispatch({
					type: 'CLAIM_REWARDS_ERROR'
				});
        dispatch(actionUnlock());
        dispatch(hideBodyLoader());
				dispatch(pushErrorMessage(error));
			});
	}
}

export function setErrorWithPushNotification(field, error) {
  return dispatch => {
    dispatch(inputError(field, error));
    dispatch(pushMessage(error));
  }
}

export function isValidAmountTokens(tokensAmount, balance, transactionAction) {
	return dispatch => {
		const tokensAmountNumber = +tokensAmount;
    if (isNaN(tokensAmountNumber)) {
      return dispatch(setErrorWithPushNotification('amountError', Constants.PROMOTE.INPUT_ERROR));
    }
  	if (tokensAmountNumber > balance) {
      return dispatch(setErrorWithPushNotification('amountError', Constants.ERROR_MESSAGES.NOT_ENOUGH_TOKENS));
		}
		transactionAction();
	}
}

export function powerUp() {
	let state = getStore().getState();
	if (state.session.actionLocked) {
		return {
			type: 'ACTION_LOCKED_POWER_UP'
		}
	}
	return dispatch => {
		dispatch(actionLock());
		dispatch(showBodyLoader());
		const {amount} = state.wallet;
		const {activeKey, saveKey} = state.activeKey;

    if (storage.accessToken) {
      WalletService.powerUpDPayId(amount)
        .then(() => {
          dispatch(actionUnlock());
          dispatch(hideBodyLoader());
        })
        .catch(error => {
          dispatch(stopTransferWithError(error));
        });
      return;
    }

		WalletService.powerUp(activeKey || storage.activeKey, amount)
			.then(() => {
				dispatch(actionUnlock());
				dispatch(hideBodyLoader());
				dispatch(closeModal("PowerUp"));
        if (saveKey && !storage.activeKey) storage.activeKey = activeKey;
				dispatch(pushMessage(Constants.WALLET.POWER_UP_SUCCESS));
			})
			.catch(error => {
        dispatch(stopTransferWithError(error));
			})
	}
}

export function powerDown() {
	let state = getStore().getState();
	if (state.session.actionLocked) {
		return {
			type: 'ACTION_LOCKED_POWER_DOWN'
		}
	}
	return dispatch => {
		const {amount, sp_received_by_delegation, sp_delegated_to_someone} = state.wallet;
    const {total_dpay_power_dpay, total_dpay_power_vests} = state.userProfile.profile;
		let amountString = amount.toString();
    amountString = amountString.match(/\d+(\.\d+)?/);
		if (amountString[0] !== amountString.input) {
      return dispatch(setErrorWithPushNotification('amountError', Constants.PROMOTE.INPUT_ERROR));
		}
    if (total_dpay_power_dpay - amount - sp_received_by_delegation - sp_delegated_to_someone <
			Constants.TRANSFER.MIN_LEAVE_DPAY_POWER) {
      return dispatch(setErrorWithPushNotification('amountError',
				`You should leave not less than ${Constants.TRANSFER.MIN_LEAVE_DPAY_POWER} BEX power (delegated consider).`))
    }
		dispatch(actionLock());
		dispatch(showBodyLoader());
		const amountVests = (amount / total_dpay_power_dpay) * total_dpay_power_vests;
		const {activeKey, saveKey} = state.activeKey;

    if (storage.accessToken) {
      WalletService.powerDownDPayId(amountVests)
        .then(() => {
          dispatch(actionUnlock());
          dispatch(hideBodyLoader());
          dispatch(getAccountsSelectiveData());
        })
        .catch(error => {
          dispatch(stopTransferWithError(error));
        });
      return;
    }

		WalletService.powerDown(activeKey || storage.activeKey, amountVests)
			.then(() => {
				dispatch(actionUnlock());
				dispatch(hideBodyLoader());
				dispatch(closeModal("PowerDown"));
        if (saveKey && !storage.activeKey) storage.activeKey = activeKey;
				dispatch(pushMessage(Constants.WALLET.POWER_DOWN_SUCCESS));
        dispatch(getAccountsSelectiveData());
			})
			.catch(error => {
        dispatch(stopTransferWithError(error));
			})
	}
}

export function cancelPowerDown() {
  let state = getStore().getState();
  if (state.session.actionLocked) {
    return {
      type: 'ACTION_LOCKED_POWER_DOWN'
    }
  }
  return dispatch => {
    dispatch(actionLock());
    dispatch(showBodyLoader());
    const amountVests = '0.000000';
    const {activeKey, saveKey} = state.activeKey;

    if (storage.accessToken) {
      WalletService.cancelPowerDownDPayId(amountVests)
        .then(() => {
          dispatch(actionUnlock());
          dispatch(hideBodyLoader());
          dispatch(addDataToWallet({next_power_down: ''}));
        })
        .catch(error => {
          dispatch(stopTransferWithError(error));
        });
      return;
    }

    WalletService.cancelPowerDown(activeKey || storage.activeKey, amountVests)
      .then(() => {
        dispatch(actionUnlock());
        dispatch(hideBodyLoader());
        dispatch(closeModal("CancelPowerDown"));
        if (saveKey && !storage.activeKey) storage.activeKey = activeKey;
        dispatch(pushMessage(Constants.WALLET.CANCEL_POWER_DOWN_SUCCESS));
        dispatch(addDataToWallet({next_power_down: ''}));
      })
      .catch(error => {
        dispatch(stopTransferWithError(error));
      })
  }
}

export function changeAmount(value) {
	const validCharacters = /^[0-9.]*$/;
	if (validCharacters.test(value)) {
		return {
			type: 'WALLET_CHANGE_AMOUNT',
			value
		}
	} else {
		return {
			type: 'WALLET_CHANGE_ERROR',
			message: 'Incorrect amount.'
		}
	}
}

export function setToken(value) {
	return {
		type: 'WALLET_SET_TOKEN',
		value
	}
}
