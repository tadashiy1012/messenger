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
    Header, Navi, Contents, Footer
} from './components';
import 'purecss/build/pure.css';
import 'material-design-icons/iconfont/material-icons.css';


const App = () => (
    <Router history={history}>
        <Provider user={userStore} say={sayStore} pc={pcStore} setting={settingStore} conn={connStateStore}>
            <div css={{width: '800px', margin: '0px auto'}}>
                <Header />
                <Navi />
                <Switch>
                    <Route path="/login">
                        <Contents.Login />
                    </Route>
                    <Route path="/user">
                        <Contents.User />
                    </Route>
                    <Route path="/notification">
                        <Contents.Notification />
                    </Route>
                    <Route path="/message">
                        <Contents.Message />
                    </Route>
                    <Route path="/search">
                        <Contents.Search />
                    </Route>
                    <Route path="/setting">
                        <Contents.Setting />
                    </Route>
                    <Route path="/debug">
                        <Contents.Debug />
                    </Route>
                    <Route path="/main">
                        <Contents.Main />
                    </Route>
                    <Route path="/">
                        <Contents.Main />
                    </Route>
                </Switch>
                <Footer />
            </div>
        </Provider>
    </Router>
);

ReactDOM.render(
    <App />,
    document.getElementById('app')
);