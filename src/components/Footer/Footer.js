import React from 'react';
import {Link} from 'react-router-dom';
import './footer.css';

class Footer extends React.Component {

	shouldComponentUpdate() {
		return false;
	}

	render() {
		return (
			<div className="wrapper_footer">
				<div className="sub-wraper_footer">
					<div className="copyright_footer">Distributed Webs Project 2018. All rights reserved</div>
					<div className="social-links_footer">
						<Link to="/guide" className="link-guidelines_footer">Guidelines</Link>
						<a href="https://itunes.apple.com/by/app/dpix/id1288494457?mt=8"
						   target="_blank"
						   rel="noopener noreferrer"
						   className="link-appstore_footer"> </a>
						<a href="https://play.google.com/store/apps/details?id=com.droid.dpix&rdid=com.droid.dpix"
						   target="_blank"
						   rel="noopener noreferrer"
						   className="link-googleplay_footer"> </a>
						<a href="https://t.me/dpixio"
						   target="_blank" rel="noopener noreferrer" className="link-telegram_footer"> </a>
						<a href="https://t.me/dpayio"
						   target="_blank" rel="noopener noreferrer" className="link-discord_footer"> </a>
					</div>
				</div>
			</div>
		);
	}
}

export default Footer;
