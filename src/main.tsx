/** @jsx jsx */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'mobx-react';
import { css, jsx } from '@emotion/core';
import { MyStore } from './stores';
import { 
    AppTitle, Status, LoginContainer, MainContainer
} from './components';
import 'purecss/build/pure.css';
import 'material-design-icons/iconfont/material-icons.css';

const App = () => (
    <Provider store={new MyStore()}>
        <div css={{width: '1024px', margin: '0px auto'}}>
            <AppTitle />
            <Status />
            <LoginContainer />
            <MainContainer />
        </div>
    </Provider>
);

ReactDOM.render(
    <App />,
    document.getElementById('app')
);