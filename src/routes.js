import React from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import App from './components/App';
import NotFound from './components/NotFound/NotFound';
import PrivateRoute from './components/Routes/PrivateRoute';
import Feed from './components/Feed/Feed';
import About from './components/About/About';
import Testing from './components/Common/Testing/Testing';
import SinglePost from './components/SinglePost/SinglePost';
import Search from './components/Search/Search';
import EditPost from './components/EditPost/EditPost';
import UserProfile from './components/UserProfile/UserProfile';
import Login from './components/Login/Login';
import Browse from './components/Browse/Browse';
import Settings from './components/Settings/Settings';
import RouteWithService from './components/Routes/RouteWithService';
import DPayId from './components/DPayId/DPayId';
import AuthService from './services/AuthService';
import Wallet from './components/Wallet/Wallet';
import BrowseServerPage from './serverPages/BrowseServerPage';
import LoginServerPage from './serverPages/LoginServerPage';
import AboutServerPage from './serverPages/AboutServerPage';
import SinglePostServerPage from './serverPages/SinglePostServerPage';
import UserProfileServerPage from './serverPages/UserProfileServerPage';
import SearchServerPage from './serverPages/SearchServerPage';
import EditPostServerPage from './serverPages/EditPostServerPage';
import NotFoundSeverPage from './serverPages/NotFoundSeverPage';

export default function getRoutes() {
	return (
		<App>
			<Switch>
				<Route exact path="/" render={() => <Redirect to="/browse"/>}/>
				<Route exact path="/dPayId" component={DPayId}/>
				<Route exact path="/signin" render={() => (
					AuthService.isAuth() ? (
						<Redirect push to="/feed"/>
					) : (
						<Login/>
					)
				)}/>
				<Route path="/guide" component={About}/>
				<Route path="/dev/test" component={Testing}/>
				<RouteWithService path="/:service(dweb)?/browse/:filter?" component={Browse}/>
				<RouteWithService path="/:service(dweb)?/post" component={SinglePost}/>
				<RouteWithService path="/:service(dweb)?/@:username" component={UserProfile}/>
				<RouteWithService path="/:service(dweb)?/search/:searchValue" component={Search}/>
				<PrivateRoute path="/:service(dweb)?/feed" component={Feed}/>
				<Redirect path="/createPost" to='/editPost'/>
				<PrivateRoute path="/:service(dweb)?/editPost/:category?/:username?/:permlink?" component={EditPost}/>
				<PrivateRoute path="/:service(dweb)?/Profile" component={UserProfile}/>
				<PrivateRoute path="/:service(dweb)?/settings" component={Settings}/>
				<PrivateRoute path="/:service(dweb)?/wallet" component={Wallet}/>
				<Route path="*" component={NotFound}/>
			</Switch>
		</App>
	);
}


export function getServerRouter() {
	return (
		<Switch>
			<Route exact path="/" component={BrowseServerPage}/>
			<RouteWithService path="/:service(dweb)?/browse/:filter?" component={BrowseServerPage}/>
			<Route exact path="/:service(dweb)?/feed" component={BrowseServerPage}/>
			<Route exact path="/signin" component={LoginServerPage}/>
			<Route path="/guide" component={AboutServerPage}/>
			<RouteWithService path="/:service(dweb)?/post" component={SinglePostServerPage}/>
			<RouteWithService path="/:service(dweb)?/@:username" component={UserProfileServerPage}/>
			<RouteWithService path="/:service(dweb)?/Profile" component={UserProfileServerPage}/>
			<RouteWithService path="/:service(dweb)?/search/:searchValue" component={SearchServerPage}/>
			<Route path="/createPost" component={EditPostServerPage}/>
			<RouteWithService path="/:service(dweb)?/editPost/:category?/:username?/:permlink?" component={EditPostServerPage}/>
			<Route path="*" component={NotFoundSeverPage}/>
		</Switch>
	)
}
