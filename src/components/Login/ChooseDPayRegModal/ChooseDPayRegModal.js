import * as React from 'react';
import {connect} from 'react-redux';
import {closeModal} from '../../../actions/modal';
import './chooseDPayRegModal.css';

class ChooseDPayRegModal extends React.Component {

	render() {
		let variantsArr = [
			{
				registrationService: 'DPay', registrationServiceImage: '/images/chooseDPayRegModal/dpay.png',
				linkToRegistrationService: 'https://signup.dpays.io', free: true, instant: false
			},
			{
				registrationService: 'DSiteSignup', registrationServiceImage: '/images/chooseDPayRegModal/dsite.png',
				linkToRegistrationService: 'https://signup.dsite.io', free: false, instant: true
			},
			{
				registrationService: 'DPayGo', registrationServiceImage: '/images/chooseDPayRegModal/dpaygo.png',
				linkToRegistrationService: 'http://dpaygo.com', free: false, instant: true
			}
		];
		let registrationVariants = variantsArr.map((item, index) => {
			return <div className="reg-service_choose-dpay-reg-mod" key={index}>
				<a href={item.linkToRegistrationService} target="_blank" rel="noopener noreferrer">
					<div className="reg-service-logo_choose-dpay-reg-mod"
					     style={{backgroundImage: `url(${item.registrationServiceImage})`}}/>
				</a>
				<p className="reg-service-name_choose-dpay-reg-mod">Register through {item.registrationService}</p>
				<p className="reg-service-params_choose-dpay-reg-mod">
					{item.free ? 'free' : 'chargeable'}, {item.instant ? 'instant' : 'not instant'}
				</p>
			</div>
		});

		return (
			<div className="wrapper_choose-dpay-reg-mod">
				<p className="title_choose-dpay-reg-mod">Choose a way to create a dPay account.</p>
				<div className="reg-services-items_choose-dpay-reg-mod">
					{registrationVariants}
				</div>
				<div className="buttons_choose-dpay-reg-mod">
					<button className="btn btn-cancel" onClick={() => this.props.closeModal()}>CANCEL</button>
				</div>
			</div>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		closeModal: () => {
			dispatch(closeModal("ChooseDPayRegModal"));
		}
	}
};

export default connect(() => {
	return {}
}, mapDispatchToProps)(ChooseDPayRegModal);
