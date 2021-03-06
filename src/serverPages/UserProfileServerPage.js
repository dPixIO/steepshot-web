import React from 'react';
import {withWrapper} from 'create-react-server/wrapper';
import {addMetaTags, getDefaultTags} from '../actions/metaTags';

class UserProfileServerPage extends React.Component {

	static async getInitialProps({location, req, res, store}) {
		if (!req || !location || !store) {
			return {};
		}
		await store.dispatch(addMetaTags(getDefaultTags(req.hostname, location.pathname)));
		return {};
	}

	render() {
		return null;
	}
}

export default withWrapper(UserProfileServerPage);
