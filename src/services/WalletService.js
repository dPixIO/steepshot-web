import ChainService from './ChainService';
import Utils from '../utils/Utils';
import Constants from '../common/constants';
import AuthService from './AuthService';

class WalletService {

  static transfer(activeKey, amount, token, to, memo) {
    return checkRecipient(to)
      .then(() => checkAmount(amount))
      .then(() => checkActiveKey(activeKey))
      .then(() => {
        let transferInfo = {
          wif: activeKey,
          recipient: to,
          amount: getValidAmountFormat(amount, token),
          memo: memo
        };
        return ChainService.sendTransferTroughBlockchain(transferInfo);
      });
  }

  static dPayIdTransfer(amount, token, to, memo = '') {
    return checkRecipient(to)
      .then(() => checkAmount(amount))
      .then(() => {
        const transferInfo = {
          to,
          amount: getValidAmountFormat(amount, token),
          memo
        };
        ChainService.sendTransferTroughBlockchain(transferInfo);
      });
  }

  static powerUp(activeKey, amount) {
    return checkActiveKey(activeKey)
      .then(() => checkAmount(amount))
      .then(() => {
        const token = ChainService.usingDWeb() ? 'BEX' : 'BEX';
        return ChainService.powerUp(activeKey, getValidAmountFormat(amount, token));
      });
  }

  static powerUpDPayId(amount) {
    return checkAmount(amount)
      .then(() => {
        const token = 'BEX';
        const powerUpInfo = {
          to: AuthService.getUsername(),
          amount: getValidAmountFormat(amount, token),
        };
        ChainService.powerUp(powerUpInfo);
      });
  }

  static powerDown(activeKey, amount) {
    return checkActiveKey(activeKey)
      .then(() => checkAmount(amount, 1))
      .then(() => {
        const token = ChainService.usingDWeb() ? 'GESTS' : 'VESTS';
        return ChainService.powerDown(activeKey, getValidAmountFormat(amount, token, true));
      });
  }

  static cancelPowerDown(activeKey, amount) {
    return checkActiveKey(activeKey)
      .then(() => {
        const token = ChainService.usingDWeb() ? 'GESTS' : 'VESTS';
        return ChainService.powerDown(activeKey, amount + ' ' + token);
      })
  }

  static powerDownDPayId(amount) {
    return checkAmount(amount, 1)
      .then(() => {
        const token = 'VESTS';
        const powerDownInfo = {
          account: AuthService.getUsername(),
          vesting_shares: getValidAmountFormat(amount, token, true),
        };
        ChainService.powerDown(powerDownInfo);
      })
  }

  static cancelPowerDownDPayId(amount) {
    const powerDownInfo = {
      account: AuthService.getUsername(),
      vesting_shares: amount + ' VESTS',
    };
    return ChainService.powerDown(powerDownInfo);
  }
}

function checkActiveKey(activeKey) {
  const error = new Error();
  error.isCustom = true;
  if (Utils.isEmptyString(activeKey)) {
    error.message = 'Active key field can\'t be empty.';
    error.field = 'activeKeyError';
    return Promise.reject(error);
  }
  return Promise.resolve();
}

function checkAmount(amount, min = Constants.TRANSFER.MIN_AMOUNT) {
  const error = new Error();
  error.isCustom = true;
  if (Utils.isEmptyString(amount)) {
    error.message = 'Amount field can\'t be empty.';
    error.field = 'amountError';
    return Promise.reject(error);
  }
  if (amount < min) {
    error.message = `Amount can't be less then ${Constants.TRANSFER.MIN_AMOUNT}.`;
    error.field = 'amountError';
    return Promise.reject(error);
  }
  return Promise.resolve();
}

function checkRecipient(recipient) {
  return ChainService.getAccounts(recipient).then(response => {
    const error = new Error();
    error.isCustom = true;
    error.field = 'toError';
    if (Utils.isEmptyString(recipient)) {
      error.message = 'Recipient can\'t be empty.';
      return Promise.reject(error);
    }
    if (!response.length) {
      error.message = Constants.AUTH_WRONG_USER;
      return Promise.reject(error);
    }
    return Promise.resolve();
  })
}

function getValidAmountFormat(amount, token, vests = false) {
  let validAmount = amount.toString();
  if (/\./.test(validAmount)) {
    validAmount = validAmount + '000';
  } else {
    validAmount = validAmount + '.000';
  }
  if (vests) {
    validAmount += '000';
    return validAmount.replace(/(\d+\.\d{6})(\d*)/, '$1') + ' ' + token;
  }
  return validAmount.replace(/(\d+\.\d{3})(\d*)/, '$1') + ' ' + token;
}

export default WalletService;
