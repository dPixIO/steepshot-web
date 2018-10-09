import React from 'react';
import {connect} from 'react-redux';
import {documentTitle} from '../../utils/documentTitle';
import './login.css';
import ShowIf from '../Common/ShowIf';
import {login} from '../../actions/auth';
import ImageGallery from './ImageGallery/ImageGallery';
import {push} from 'react-router-redux';
import Constants from '../../common/constants';
import {switchService} from '../../actions/services';
import {clearLoginErrors} from '../../actions/login';
import Switcher from '../Switcher/Switcher';
import ChooseDPayRegModal from './ChooseDPayRegModal/ChooseDPayRegModal';
import {openModal} from '../../actions/modal';
import DPayId from '../../services/DPayId';
import GrayInput from '../Common/GrayInput/GrayInput';

const galleryImages = [
	'/images/login/1.png',
	'/images/login/2.png',
	'/images/login/3.png',
	'/images/login/4.png',
	'/images/login/5.png',
	'/images/login/6.png',
	'/images/login/7.png',
	'/images/login/8.png',
	'/images/login/9.png',
	'/images/login/10.png'
];

class Login extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			openVideo: false
		};
		this.clearLoginErrors = this.clearLoginErrors.bind(this);
		documentTitle();
	}

	openRegisterSite(event) {
		event.preventDefault();
		if (this.props.chooseDPay) {
			let modalOption = {
				body: (<ChooseDPayRegModal/>),
			};
			this.props.openModal('ChooseDPayRegModal', modalOption);
		} else {
			window.open('https://signup.dsite.io');
		}
	}

	handleLogin(e) {
		e.preventDefault();
		let nameValue = this.name.value;
		let passwordValue = this.password.value;
		nameValue = nameValue.replace(/\s+/g, '');
		nameValue = nameValue.replace(/@([\w-.]+)/, '$1');
		passwordValue = passwordValue.replace(/\s+/g, '');
		this.props.login(nameValue.toLowerCase(), passwordValue);
	}

	loginWithDPayId() {
		DPayId.getLoginUrl();
		window.location.assign(DPayId.getLoginUrl() + '&expires_in=604800');
	}

	clearLoginErrors() {
		if (!this.props.usernameError && !this.props.postingKeyError) {
			return;
		}
		this.props.clearLoginErrors();
	}

	render() {
		const {chooseDPay, usernameError, postingKeyError} = this.props;
		return (
			<div className="container_login">
				<ShowIf show={!this.props.isMobileScreen}>
					<div className="welcome-container_login">
						<ImageGallery images={galleryImages}/>
						<div className="gallery-shadow_login"/>
						<div className="welcome-body_login">
							<div className="welcome-title_login">
								Welcome to dPix
							</div>
							<div className="welcome-description_login">
								Platform that rewards people for sharing their lifestyle and visual experience
							</div>
							<button className="guidelines-btn_login" onClick={() => {
								this.props.historyPush('/guide');
							}}>
								LINK TO OUR GUIDELINES
							</button>
						</div>
					</div>
				</ShowIf>
				<div className="form-container_login">
					<div className="form-body_login">
						<form className="form_login">
							<div className="title_login">
								Sign in to dPix
							</div>
							<div className="input-block_login">
								<GrayInput type="text" label="Username" placeholder="username" ref={ref => this.name = ref}
								           onChange={this.clearLoginErrors} error={usernameError} name="login"/>
								<GrayInput type="password" label="Private posting key" placeholder="e.g. STG52aKIcG9..."
								           ref={ref => this.password = ref} onChange={this.clearLoginErrors} error={postingKeyError}
								           name="password"/>
							</div>
							<div className="btn-block_login">
								<Switcher
									onClick={() => {
										this.clearLoginErrors();
										this.props.switchService();
									}}
									left={chooseDPay}
									leftLabel="dPay"
									rightLabel="dPay"
								/>
								<button className="sign_login btn btn-default" onClick={this.handleLogin.bind(this)} type="submit">
									LOGIN
								</button>
							</div>
						</form>
					</div>
					<div className={'registration-block_login login-dpay-con-block_login' +
					(chooseDPay ? '' : ' hide-log-ste-con-block_login')}>
						<label>Don’t you trust us?</label>
						<button className="dpay-con-btn_login" onClick={this.loginWithDPayId.bind(this)}>
							{(this.props.isMobileScreen ? '' : 'LOGIN WITH ') + 'DPAYID'}
						</button>
					</div>
					<div className="registration-block_login">
						<label>Don’t have a {chooseDPay ? 'dPay' : 'dWeb'} account?</label>
						<button className="guidelines-btn_login create-acc_login" onClick={this.openRegisterSite.bind(this)}>
							REGISTRATION
						</button>
					</div>
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		user: state.auth.user,
		isMobileScreen: state.window.isMobileScreen,
		chooseDPay: state.services.name === Constants.SERVICES.dpay.name,
		usernameError: state.login.usernameError,
		postingKeyError: state.login.postingKeyError
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		login: (name, postingKey) => {
			dispatch(login(name, postingKey));
		},
		historyPush: (path) => {
			dispatch(push(path));
		},
		switchService: () => {
			dispatch(switchService());
		},
		clearLoginErrors: () => {
			dispatch(clearLoginErrors());
		},
		openModal: (index, options) => {
			dispatch(openModal(index, options));
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
