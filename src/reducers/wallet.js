const initialState = {
  amount: 0.001,
  amountError: '',
  selectedToken: 0,
  next_power_down: '',
  bbd_rewards: 0,
  dpay_rewards: 0,
  dpay_power_rewards: 0,
  noRewards: true,
  tokenValue: [
    0,
    0
  ]
};

export default function wallet(state = initialState, action) {
  switch (action.type) {
    case 'WALLET_SET_TOKEN':
      return {
        ...state,
        selectedToken: action.value
      };

    case 'WALLET_CHANGE_AMOUNT':
      return {
        ...state,
        amount: action.value,
        amountError: ''
      };

    case 'TRANSFER_ERROR':
      if (action.amountError) {
        return {
          ...state,
          amountError: action.amountError
        };
      }
      return state;

    case 'GET_USER_PROFILE_SUCCESS':
      return {
        ...state,
        tokenValue: [
          action.profile.balance,
          action.profile.bbd_balance
        ]
      };

    case 'CLOSE_MODAL':
      if (action.index === 'Transfer' || action.index === 'PowerUp' || action.index === 'PowerDown') {
        return {
          ...state,
          amount: initialState.amount,
          amountError: initialState.amountError,
          selectedToken: initialState.selectedToken
        };
      }
      return state;

    case 'ADD_DATA_TO_WALLET':
      return {
        ...state,
        ...action.data
      };

    default:
      return state;
  }
}
