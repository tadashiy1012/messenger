/** @jsx jsx */
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Switch, Route } from 'react-router-dom';
import { Provider } from 'mobx-react';
import { css, jsx } from '@emotion/core';
import { 
    history, userStore, sayStore, pcStore, settingStore, connStateStore
} from './stores';
import { 
    AppTitle, Status, Navi, Container
} from './components';
import 'purecss/build/pure.css';
import 'material-design-icons/iconfont/material-icons.css';


const App = () => (
    <Router history={history}>
        <Provider user={userStore} say={sayStore} pc={pcStore} setting={settingStore} conn={connStateStore}>
            <div css={{width: '800px', margin: '0px auto'}}>
                <AppTitle />
                <Status />
                <Navi />
                <Switch>
                    <Route path="/login">
                        <Container.Login />
                    </Route>
                    <Route path="/user">
                        <Container.User />
                    </Route>
                    <Route path="/notification">
                        <Container.Notification />
                    </Route>
                    <Route path="/message">
                        <Container.Message />
                    </Route>
                    <Route path="/search">
                        <Container.Search />
                    </Route>
                    <Route path="/setting">
                        <Container.Setting />
                    </Route>
                    <Route path="/debug">
                        <Container.Debug />
                    </Route>
                    <Route path="/main">
                        <Container.Main />
                    </Route>
                    <Route path="/">
                        <Container.Main />
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