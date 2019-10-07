/** @jsx jsx */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Router, Switch, Route } from 'react-router-dom';
import { Provider } from 'mobx-react';
import { css, jsx } from '@emotion/core';
import { 
    history, userStore, sayStore, pcStore, settingStore, connStateStore
} from './stores';
import { 
    AppTitle, Status, LoginContainer, TimeLine, 
    Setting as MySetting, User as MyUser, Navi
} from './components';
import 'purecss/build/pure.css';
import 'material-design-icons/iconfont/material-icons.css';

const Main = () => (
    <React.Fragment>
        <h2 css={{margin:'8px 0px'}}>Main</h2>
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

const App = () => (
    <Router history={history}>
        <Provider user={userStore} say={sayStore} pc={pcStore} setting={settingStore} conn={connStateStore}>
            <div css={{width: '800px', margin: '0px auto'}}>
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