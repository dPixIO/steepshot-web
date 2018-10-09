import React from 'react';
import {connect} from 'react-redux';
import './wallet.css';
import WidgetToken from './WidgetToken/WidgetToken';
import TransactionHistory from './TransactionHistory/TransactionHistory';
import LoadingSpinner from '../LoadingSpinner';
import {getUserProfile} from '../../actions/userProfile';
import Utils from '../../utils/Utils';
import {openModal} from '../../actions/modal';
import Transfer from '../Modals/Transfer/Transfer';
import ShowIf from '../Common/ShowIf';
import PowerUp from '../Modals/PowerUp/PowerUp';
import PowerDown from '../Modals/PowerDown/PowerDown';
import ChainService from '../../services/ChainService';
import {claimAccountRewards, getAccountsSelectiveData, setToken} from '../../actions/wallet';
import {documentTitle} from '../../utils/documentTitle';
import CancelPowerDown from '../Modals/CancelPowerDown/CancelPowerDown';
//import {addAndStringToLastItem} from '../../utils/addAndStringToLastItem';

const DESCRIPTION = {
  BEX: `Tradeable tokens that may be transferred anywhere at anytime.
  DPay  can be converted to BEX POWER in a process called powering up.`,
  BP: `Influence tokens which give you more control over post payouts
	and allow you to earn on curation rewards.`,
  BBD: `Tradeable tokens that may be transferred anywhere at anytime.`,
  BEX: `Перемещаемые цифровые токены, которые могут переданы куда угодно
	в любой момент. Голос может быть конвертирован в Силу Голоса, этот процесс
	называется "увеличение Силы Голоса".`,
  BP: `Сила Голоса неперемещаемая, её количество увеличивается при долгосрочном
	хранении. Чем больше у Вас Силы Голоса, тем сильней вы влияете на вознаграждения
	за пост и тем больше зарабатываете за голосование.`,
  BBD: `Перемещаемые цифровые токены, цена которых равна ~1 мг золота в GOLOS.`
};

class Wallet extends React.Component {

  constructor(props) {
    super();
    props.getUserProfile();
    props.getAccountsSelectiveData();
    this.transferDPay = this.transferDPay .bind(this);
    this.powerUp = this.powerUp.bind(this);
    this.powerDown = this.powerDown.bind(this);
    this.cancelPowerDown = this.cancelPowerDown.bind(this);
    this.claimAccountRewards = this.claimAccountRewards.bind(this);
    documentTitle();
  }

  transfer() {
    let modalOption = {
      body: (<Transfer/>)
    };
    this.props.openModal("Transfer", modalOption);
  }

  transferDPay () {
    this.props.setToken(0);
    this.transfer();
  }

  transferBbd() {
    this.props.setToken(1);
    this.transfer();
  }

  powerUp() {
    let modalOption = {
      body: (<PowerUp/>)
    };
    this.props.openModal("PowerUp", modalOption);
  }

  powerDown() {
    let modalOption = {
      body: (<PowerDown/>)
    };
    this.props.openModal("PowerDown", modalOption);
  }

  cancelPowerDown() {
    let modalOption = {
      body: (<CancelPowerDown/>)
    };
    this.props.openModal("CancelPowerDown", modalOption);
  }

  claimAccountRewards() {
    this.props.claimAccountRewards(this.props.dpay_rewards, this.props.bbd_rewards, this.props.dpay_power_rewards_in_vests);
  }

  renderClaimRewards(bbd_rewards, dpay_rewards, dpay_power_rewards) {
    if (this.props.mobileScreen) {
      return (
        <div className="centered--flex">
          <div className="mobile-claim-rewards-wrapper_wallet">
            <div className="text-claim-reward_wallet">{/*Current rewards:&nbsp;
							{addAndStringToLastItem([bbd_rewards, dpay_rewards, dpay_power_rewards])}*/}
              Hello. It's time to claim rewards!
            </div>
            <button className="button_widget-token" onClick={this.claimAccountRewards}>CLAIM REWARDS NOW</button>
            <div className="gift-boxes_wallet"/>
          </div>
        </div>
      );
    } else {
      return (
        <div className="claim-reward-wrapper_wallet">
          <div className="centered--flex">
            <div className="gift-boxes_wallet"/>
            <div className="text-claim-reward_wallet">{/*Current rewards:&nbsp;
              {addAndStringToLastItem([bbd_rewards, dpay_rewards, dpay_power_rewards])}*/}
              Hello. It's time to claim rewards!
            </div>
          </div>
          <button className="button_widget-token" onClick={this.claimAccountRewards}>CLAIM REWARDS NOW</button>
        </div>
      );
    }
  }

  render() {
    const {
      cost, dpay, bp, bbd, isDWebService, bbd_rewards, dpay_rewards, dpay_power_rewards,
      noRewards, isPoweringDown
    } = this.props;
    if (Utils.isEmpty(cost) || Utils.isEmpty(dpay) || Utils.isEmpty(bp) || Utils.isEmpty(bbd)) {
      return global.isServerSide ? null : <LoadingSpinner center={true}/>;
    }
    return (
      <div className="container">
        <div className="container_wallet">
          <ShowIf show={!noRewards}>
            {this.renderClaimRewards(bbd_rewards, dpay_rewards, dpay_power_rewards)}
          </ShowIf>
          <div className="header_wallet">
            <div className="title_wallet">
              Account balance
            </div>
            <div className="account-balance_wallet">
              {cost} $
            </div>
          </div>
          <div className="body_wallet">
            <WidgetToken
              background={{
                image: '/images/wallet/dpay.png',
                color: 'rgb(74, 144, 226)'
              }}
              fullName={isDWebService ? 'DWEB' : 'DPAY'}
              point="dpay"
              coin={isDWebService ? 'BEX' : 'BEX'}
              value={dpay}
              description={isDWebService ? DESCRIPTION.DWEB : DESCRIPTION.DPAY}
              actions={isDWebService ?
                [{
                  label: 'Transfer',
                  icon: '/images/wallet/buttons/transfer.svg',
                  onClick: this.transferDPay
                }] :
                [{
                  label: 'Transfer',
                  icon: '/images/wallet/buttons/transfer.svg',
                  onClick: this.transferDPay
                }, {
                  label: 'Power up',
                  icon: '/images/wallet/buttons/powerUp.svg',
                  onClick: this.powerUp
                }]
              }
            />
            <WidgetToken
              background={{
                image: '/images/wallet/bp.png',
                color: 'rgb(103, 184, 47)'
              }}
              fullName={isDWebService ? 'BEX POWER' : 'BEX POWER'}
              point="bp"
              coin={isDWebService ? 'BEX' : 'BEX'}
              value={bp}
              description={isDWebService ? DESCRIPTION.SG : DESCRIPTION.BP}
              actions={isDWebService ? [] :
                [{
                  label: 'Power up',
                  icon: '/images/wallet/buttons/powerUp.svg',
                  onClick: this.powerUp
                },
                isPoweringDown ? {
                  label: 'Cancel power down',
                  icon: '/images/wallet/buttons/cancelPowerDown.png',
                  onClick: this.cancelPowerDown
                } : {
                  label: 'Power down',
                  icon: '/images/wallet/buttons/powerDown.svg',
                  onClick: this.powerDown
                }]
              }
            />
            <WidgetToken
              background={{
                image: '/images/wallet/bbd.png',
                color: 'rgb(218, 146, 44)'
              }}
              fullName={isDWebService ? 'BEX DOLLARS' : 'BEX DOLLARS'}
              point="bbd"
              coin={isDWebService ? 'BBD' : 'BBD'}
              value={bbd}
              description={isDWebService ? DESCRIPTION.GBG : DESCRIPTION.BBD}
              textButton="TRANSFER"
              actions={
                [{
                  label: 'Transfer',
                  icon: '',
                  onClick: this.transferBbd.bind(this)
                }]
              }
            />
          </div>
          <ShowIf show={!isDWebService}>
            <TransactionHistory/>
          </ShowIf>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  if (!state.userProfile.profile) {
    return {};
  }
  const {balance, bbd_balance, total_dpay_power_dpay, estimated_balance} = state.userProfile.profile;
  const {
    bbd_rewards, dpay_rewards, dpay_power_rewards, dpay_power_rewards_in_vests, noRewards,
    next_power_down
  } = state.wallet;
  const isDWebService = ChainService.usingDWeb();
  return {
    isDWebService,
    cost: estimated_balance,
    dpay: balance,
    isPoweringDown: !!next_power_down,
    bp: total_dpay_power_dpay,
    bbd: bbd_balance,
    bbd_rewards: bbd_rewards ? (bbd_rewards + ' BBD') : '',
    dpay_rewards: dpay_rewards ? (dpay_rewards + ' BEX') : '',
    dpay_power_rewards: dpay_power_rewards ? (dpay_power_rewards + ' BEX POWER') : '',
    dpay_power_rewards_in_vests: dpay_power_rewards_in_vests ? (dpay_power_rewards_in_vests + ' VESTS') : '',
    noRewards,
    mobileScreen: state.window.width <= 650
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getUserProfile: username => {
      dispatch(getUserProfile(username));
    },
    openModal: (index, options) => {
      dispatch(openModal(index, options));
    },
    setToken: token => {
      dispatch(setToken(token));
    },
    getAccountsSelectiveData: () => {
      dispatch(getAccountsSelectiveData());
    },
    claimAccountRewards: (dpay_tokens, bbd_tokens, dpay_power) => {
      dispatch(claimAccountRewards(dpay_tokens, bbd_tokens, dpay_power));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Wallet);
