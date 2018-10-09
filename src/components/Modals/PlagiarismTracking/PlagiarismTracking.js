import * as React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import {closeModal} from '../../../actions/modal';
import {continuePublishing} from '../../../actions/plagiarismTracking';
import './plagiarismTracking.css';

class PlagiarismTracking extends React.Component {

	renderImage() {
		let image = {
			background: `#f4f4f6 url('${this.props.data.media.thumbnails[1024]}') center no-repeat`,
			backgroundSize: 'contain'
		};
		return (
			<div className="image_plag-track" style={image}/>
		)
	}

	closeModal() {
		this.props.closeModal('PlagiarismTrackingModal');
	}

	plagiarismAuthor() {
		let plagiator = this.props.data.plagiarism_author;
		if (this.props.authUser === plagiator) {
			return (
				<span>you. We do not recommend you to re-upload photos
					as it may result in low payouts and reputation loss.</span>
			)
		}
		let linkToPlagUser = `/@${plagiator}`;
		return (
			<span>
				<Link to={linkToPlagUser} target="_blank"> @{plagiator}</Link>. We do not recommend you to upload other
				users' photos as it may result in low payouts and reputation loss.
			</span>
		)
	}

	plagiarismSubText() {
		let plagiator = this.props.data.plagiarism_author;
		let linkToPlagPhoto = `/post/@${plagiator}/${this.props.data.plagiarism_permlink}`;
		if (this.props.authUser === plagiator) {
			return ''
		}
		return (
			<p className="sub-descrip_plag-track">If you're sure that you are the author of the photo, please flag and/or
				leave a comment under the
				<Link to={linkToPlagPhoto} target="_blank"> photo </Link>
				to let other people know they should flag this post.</p>
		)
	}

	render() {
		return (
			<div className="wrapper_plag-track">
				<div className="title-wrapper_plag-track">
					<p className="title_plag-track">PLAGIARISM CHECK</p>
					<p>
						<Link to="/guide" target="_blank">Guidelines</Link>
					</p>
				</div>
				{this.renderImage()}
				<p className="descrip_plag-track">We have found a
					<Link to={`/post/@${this.props.data.plagiarism_author}/${this.props.data.plagiarism_permlink}`}
					      target="_blank"> similar photo</Link> in dPix, uploaded by {this.plagiarismAuthor()}
				</p>
				{this.plagiarismSubText()}
				<p className="guidelines_plag-track">
					<a href={`https://dpix.network/ipfs/${this.props.data.ipfs}`} target="_blank">IPFS link</a>
				</p>
				<div className="buttons_plag-track">
					<button className="btn btn-cancel" onClick={this.closeModal.bind(this)}>NO, CANCEL PUBLISHING</button>
					<button className="btn btn-default" onClick={() => this.props.continuePublishing(this.props.data)}>
						YES, CONTINUE PUBLISHING
					</button>
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state, props) => {
	return {
		...props,
		authUser: state.auth.user
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		closeModal: (index) => {
			dispatch(closeModal(index));
		},
		continuePublishing: (data) => {
			dispatch(continuePublishing(data));
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(PlagiarismTracking);
