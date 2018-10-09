import React from 'react';
import './inOutDPay.css';
import {connect} from 'react-redux';

const InOutDPay = ({balance, total_dpay_power_dpay, newDPay, newDPayPower}) => (
  <div className="wrapper_in-out-dpay">
    <div className="dpay-amount_in-out-dpay">
      <span>BEX</span>
      <span className="display--flex">
        <span className="start-balance_in-out-dpay">{balance} >&nbsp;</span>
        <span className="short-amount_in-out-dpay">{newDPay}</span>
      </span>
    </div>
    <div className="border-line_in-out-dpay"/>
    <div className="dpay-power-amount_in-out-dpay">
      <span>BEX Power</span>
      <span className="display--flex">
        <span className="start-balance_in-out-dpay">{total_dpay_power_dpay} >&nbsp;</span>
        <span className="short-amount_in-out-dpay">{newDPayPower}</span>
      </span>
    </div>
  </div>
);

const mapStateToProps = (state, props) => {
  const {amount} = state.wallet;
  const {balance, total_dpay_power_dpay} = state.userProfile.profile;
  let newDPay, newDPayPower;
  let tokensAmount = +amount || 0;

  if (props.point === 'power-up') {
    newDPay = balance - tokensAmount;
    newDPayPower = total_dpay_power_dpay + tokensAmount;
  }
  if (props.point === 'power-down') {
    newDPay = balance + tokensAmount ;
    newDPayPower = total_dpay_power_dpay - tokensAmount;
  }
  return {
    balance,
    total_dpay_power_dpay,
    newDPay: newDPay.toFixed(3) / 1,
    newDPayPower: newDPayPower.toFixed(3) / 1
  }
};

export default connect(mapStateToProps)(InOutDPay);
