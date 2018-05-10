import React from 'react';
import {setOldSettings, toggleLowRated, toggleNsfw, updateSettings} from '../../actions/settings';
import {connect} from 'react-redux';
import {goBack} from "react-router-redux";
import {pushMessage} from "../../actions/pushMessage";
import './settings.css';
import Constants from "../../common/constants";
import {withWrapper} from "create-react-server/wrapper";
import SettingsField from "./SettingsField/SettingsField";
import {registerForPushNotifications} from "../../actions/oneSignal";

class Settings extends React.Component {

	componentWillUnmount() {
		this.props.setOldSettings();

	}

	submit(e) {
		e.preventDefault();
		this.props.updateSettings(this.props.lowRated, this.props.nsfw);
		this.props.historyGoBack();
		this.props.pushMessage(Constants.SETTINGS_CHANGED_MESSAGE);
	}

	render() {
		if (global.isServerSide) {
			return null;
		}
		return (
			<div className="container_settings">
				<div className="header_settings">
					<span>SETTINGS</span>
				</div>
				<div className="body_settings">
					<SettingsField label="Show low rated posts" active={this.props.lowRated} onClick={this.props.toggleLowRated}/>
					<SettingsField label="Show NSFW posts" active={this.props.nsfw} onClick={this.props.toggleNsfw}/>
					<button className="save_settings" onClick={this.submit.bind(this)}>Save</button>
					<button id="subscribe" onClick={window.subscribeOneSignal}>Subscribe </button>
					<button id="unsubscribe"  onClick={window.unSubscribeOneSignal}>Unsubscribe </button>
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		lowRated: state.settings.lowRatedBtn,
		nsfw: state.settings.nsfwBth,

	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		updateSettings: (lowRated, nsfw) => {
			dispatch(updateSettings(lowRated, nsfw));
		},
		historyGoBack: () => {
			dispatch(goBack());
		},
		pushMessage: (message) => {
			dispatch(pushMessage(message))
		},
		toggleLowRated: () => {
			dispatch(toggleLowRated())
		},
		toggleNsfw: () => {
			dispatch(toggleNsfw())
		},
		setOldSettings: () => {
			dispatch(setOldSettings())
		}
	};
};

export default withWrapper(connect(mapStateToProps, mapDispatchToProps)(Settings));
