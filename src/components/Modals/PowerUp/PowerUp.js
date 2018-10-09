import React from 'react';
import {connect} from 'react-redux';
import './powerUp.css';
import WalletPopupTemplate from '../WalletPopupTemplate/WalletPopupTemplate';
import {closeModal} from '../../../actions/modal';
import PowerForm from '../../Common/PowerForm/PowerForm';
import {changeAmount, powerUp, isValidAmountTokens} from '../../../actions/wallet';
import InOutDPay from '../WalletPopupTemplate/InOutDPay/InOutDPay';

class PowerUp extends React.Component {

	constructor() {
		super();
		this.sendPowerUp = this.sendPowerUp.bind(this);
	}

  sendPowerUp() {
    this.props.isValidAmountTokens(this.props.amount, this.props.balance, this.props.powerUp);
  }

	render() {
		const {username, balance, amount, token, amountError} = this.props;
		return (
			<WalletPopupTemplate title="CONVERT TO BEX POWER"
			                     username={username}
			                     textButton="POWER UP"
			                     cancel={this.props.closePowerUpModal}
			                     ok={this.sendPowerUp}>
				<InOutDPay point="power-up"/>
				<div className="description_power-up">
					Tokens give you the ability to influence the reward for content.
				</div>
				<div className="description_power-up">
					BEX POWER - non-liquid tokens, it takes three months (13 weekly payments) to convert them into dPay's
					liquid tokens.
				</div>
				<PowerForm amount={amount}
				           amountError={amountError}
				           amountOnChange={this.props.changeAmount}
				           className="form_power-up"
				           tokensAmount={balance}
				           token={token}
				/>
			</WalletPopupTemplate>
		);
	}
}

const mapStateToProps = state => {
	const {balance} = state.userProfile.profile;
	const {amount, amountError} = state.wallet;
	const {tokensNames} = state.services;
	return {
		username: state.auth.user,
		token: tokensNames[0],
		balance,
		amount,
		amountError
	}
};

const mapDispatchToProps = dispatch => {
	return {
		closePowerUpModal: () => {
			dispatch(closeModal("PowerUp"))
		},
		powerUp: () => {
			dispatch(powerUp())
		},
		changeAmount: value => {
			dispatch(changeAmount(value))
		},
    isValidAmountTokens: (tokensAmount, balance, transactionAction) => {
      dispatch(isValidAmountTokens(tokensAmount, balance, transactionAction))
    }
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(PowerUp);
