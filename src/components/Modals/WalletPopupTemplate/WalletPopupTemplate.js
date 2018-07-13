import React from 'react';
import './walletPopupTemplate.css';

const WalletPopupTemplate = ({title, username, textButton, cancel, ok, children}) => (
	<div className="container_wal-pop-tem">
		<div className="header_wal-pop-tem">
			<div className="title_wal-pop-tem">
				{title}
			</div>
			<div className="username_wal-pop-tem">
				@{username}
			</div>
		</div>
		<div className="body_wal-pop-tem">
			{children}
		</div>
		<div className="buttons_wal-pop-tem clearfix">
			<button className="btn btn-cancel" onClick={cancel}>CANCEL</button>
			<button className="btn btn-default" onClick={ok}>{textButton}</button>
		</div>
	</div>
);

export default WalletPopupTemplate;