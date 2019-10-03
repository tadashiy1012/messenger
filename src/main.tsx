/** @jsx jsx */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {HashRouter as Router, Switch, Route, Link} from 'react-router-dom';
import {createHashHistory} from 'history';
import { Provider, observer, inject } from 'mobx-react';
import { css, jsx } from '@emotion/core';
import { MyStore } from './stores';
import { 
    AppTitle, Status, LoginContainer, TimeLine, 
    Setting as MySetting, User as MyUser
} from './components';
import 'purecss/build/pure.css';
import 'material-design-icons/iconfont/material-icons.css';
import { MyStoreType } from './types';

const store = new MyStore();
store.setHistory = createHashHistory();

const Main = () => (
    <React.Fragment>
        <h2>Main</h2>
        <TimeLine />
    </React.Fragment>
);

const Login = () => (
    <React.Fragment>
        <h2>Login/Registration</h2>
        <LoginContainer />
    </React.Fragment>
);

const User = () => (
    <React.Fragment>
        <h2>User</h2>
        <MyUser />
    </React.Fragment>
);

const Setting = () => (
    <React.Fragment>
        <h2>Setting</h2>
        <MySetting />
    </React.Fragment>
);

@inject('store')
@observer
class Navi extends React.Component<{store?: MyStoreType}> {
    render() {
        const {store} = this.props;
        const loggedMenu = <React.Fragment>
            <Link to={{pathname:'/user', search: store!.getUser ? '?tgt=' + store!.getUser.serial : ''}}
                className="pure-button" css={{margin:'0px 4px'}}>User</Link>
            <Link to="/setting" className="pure-button" css={{margin:'0px 4px'}}>Setting</Link>
        </React.Fragment>
        return <React.Fragment>
            <div css={{display:'flex'}}>
                <Link to="/" className="pure-button" css={{margin:'0px 4px'}}>Main</Link>
                <Link to="/login" className="pure-button" css={{margin:'0px 4px'}}>Login</Link>
                {store!.logged ? loggedMenu : null}
            </div>
        </React.Fragment>
    }
}

const App = () => (
    <Router>
        <Provider store={store}>
            <div css={{width: '1024px', margin: '0px auto'}}>
                <AppTitle />
                <Status />
                <Navi />
                <Switch>
                    <Route path="/login">
                        <Login />
                    </Route>
                    <Route path="/user">
                        <User />
                    </Route>
                    <Route path="/setting">
                        <Setting />
                    </Route>
                    <Route path="/main">
                        <Main />
                    </Route>
                    <Route path="/">
                        <Main />
                    </Route>
                </Switch>
            </div>
        </Provider>
    </Router>
);

ReactDOM.render(
    <App />,
    document.getElementById('app')
);