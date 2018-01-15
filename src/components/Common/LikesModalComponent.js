import React from 'react';
import { getStore } from '../../store/configureStore';
import { connect } from 'react-redux';
import { getVoters } from '../../actions/voters';
import UserItem from '../UserProfile/userItem';
import Constants from '../../common/constants';
import ScrollViewComponent from '../Common/ScrollViewComponent';
import InfiniteScroll from 'react-infinite-scroller';
import { debounce } from 'lodash';
import LoadingSpinner from '../LoadingSpinner';
import TabsFilterComponent from '../Filters/TabsFilterComponent';
import TabsWrapper from '../Wrappers/TabsWrapper';
import Modal from '../Common/Modal/Modal';
import ShowIf from "./ShowIf";
import utils from "../../utils/utils";

class LikesModalComponent extends React.Component {
  constructor(props) {
    super();
    this.state = {
      ...this.getInitialData,
      forWindowSize: false
    }
  }

  get getInitialData() {
    return {
      offset : null,
      previousRequestOffset : 'default offset',
      voters : [],
      hasMore : true,
      options : {},
      count : 0,
      initialLoading : true
    }
  }

  get permLink() {
    if (this.state.url == undefined) {
      console.warn('permLink is undefined');
    } else {
      let urlObject = this.state.url.split('/');
      if (urlObject.length < 2) {
        console.warn('Some troubles with permLink in LikesComponent');
        return '';
      }
      return `${urlObject[urlObject.length - 2]}/${urlObject[urlObject.length - 1]}`
    }
  }

  selectVotesInfo(state) {
    return state.votes;
  }

  windowSizeFunc() {
    if (document.documentElement.clientWidth <= 420) {
      this.setState({forWindowSize : true});
    }
  }
  componentDidMount() {
    this.windowSizeFunc();
    let unsubscribe = getStore().subscribe(this.usersChanged.bind(this));
  }

  fetchData() {
    if (this.state.offset == this.state.previousRequestOffset) return false;
    const options = {
      point : `post/${this.permLink}/voters`,
      params : Object.assign({}, {
          offset : this.state.offset
        },
        this.state.options)
    };
    getVoters(options, this.props.dispatch.bind(this));
  }

  usersChanged() {
    let votersInfo = this.selectVotesInfo(getStore().getState());
    if (utils.isEmptyString(votersInfo.url)) {
      return;
    }
    if (this.state.url != votersInfo.url || votersInfo.voters.results.length == 0) {
      this.setState({
        ...this.getInitialData,
        url : votersInfo.url
      }, () => {
        this.fetchData();
      });
    } else {
      this.setState({
        previousRequestOffset : this.state.offset,
        offset : votersInfo.voters.offset,
        voters : votersInfo.voters.results,
        count : votersInfo.voters.total_count,
        hasMore : votersInfo.voters.total_count != votersInfo.voters.results.length,
        initialLoading : false
      });
    }
  }

  get votersData() {
    let items = this.state.voters.map((voter, index) =>
      <UserItem
        item={{
          author : voter.author,
          name : voter.name,
          avatar : voter.avatar
        }}
        key={index}
      />
    );
    return items;
  }

  get voters() {
    if (this.state.initialLoading) {
      return  (
        <LoadingSpinner/>
      )
    }
    if (this.state.voters.length == 0) {
      return <div className="empty-query-message">{Constants.EMPTY_QUERY_VOTERS}</div>
    }
    return (
      <ScrollViewComponent
        ref={ ref => {this.scrollView = ref} }
        wrapperModifier="user-list"
        scrollViewModifier="list-scroll__view"
        autoHeight={true}
        autoHeightMax={window.innerHeight * 0.8}
        autoHide={true}
      >
        <InfiniteScroll
          pageStart={0}
          initialLoad={false}
          loadMore={debounce(this.fetchData.bind(this), Constants.ENDLESS_SCROLL.DEBOUNCE_TIMEOUT)}
          hasMore={this.state.hasMore}
          loader={
            <div className="position--relative">
              <LoadingSpinner/>
            </div>
          }
          threshold={Constants.ENDLESS_SCROLL.OFFSET}
          useWindow={false}
          useCapture={true}
        >
          <div className="clearfix">
            {this.votersData}
          </div>
        </InfiniteScroll>
      </ScrollViewComponent>
    )
  }

  render() {
    return (
      <div id="likesModal" tabIndex="-1" role="dialog" aria-hidden="true" className="modal modal-like">
        <div className="modal-dialog">
          <div className="modal-content likes-modal__content">
            <div className="modal-header">
              <div className="modal-title clearfix">
                {Constants.POST_LIKED_BY}
                <ShowIf show={this.state.forWindowSize}>
                  <button className="close" data-dismiss="modal"/>
                </ShowIf>
              </div>
            </div>
            <div className="modal-like__body">
              {this.voters}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    localization: state.localization
  };
};

export default connect(mapStateToProps)(LikesModalComponent);
