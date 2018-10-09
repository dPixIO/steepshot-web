import React from 'react';
import {connect} from 'react-redux'
import Utils from '../../utils/Utils';
import {loginWithDPayId} from '../../actions/login';

class DPayId extends React.Component {
	constructor(props) {
		super();
		props.loginWithDPayId(Utils.urlParamsToObject(props.location.search));
	}

	render() {
		return null;
	}
}

const mapDispatchToProps = dispatch => {
	return {
		loginWithDPayId: params => {
			dispatch(loginWithDPayId(params))
		}
	}
};

export default connect(() => {}, mapDispatchToProps)(DPayId);