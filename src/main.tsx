/** @jsx jsx */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'mobx-react';
import { css, jsx } from '@emotion/core';
import { MyStore, } from './store';
import { 
    AppTitle, Status, LoginContainer, Writer, TimeLine 
} from './components';
import 'purecss/build/pure.css';

const App = () => (
    <Provider store={new MyStore()}>
        <div css={{width: '1024px', margin: '0px auto'}}>
            <AppTitle />
            <Status />
            <LoginContainer />
            <h2 css={{marginBottom:'2px'}}>main</h2>
            <Writer />
            <TimeLine />
        </div>
    </Provider>
);

ReactDOM.render(
    <App />,
    document.getElementById('app')
);