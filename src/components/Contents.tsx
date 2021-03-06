/** @jsx jsx */
import * as React from 'react';
import { css, jsx } from '@emotion/core';
import {
    Timeline, Login, User, Notification, Message, Search, Setting, Debug
} from './modules';

const _Main = () => (
    <React.Fragment>
        <h2 css={{margin:'8px 0px'}}>Main</h2>
        <Timeline />
    </React.Fragment>
);

const _Login = () => (
    <React.Fragment>
        <h2>Login/Registration</h2>
        <Login />
    </React.Fragment>
);

const _User = () => (
    <React.Fragment>
        <h2>User</h2>
        <User />
    </React.Fragment>
);

const _Notification = () => (
    <React.Fragment>
        <h2>Notification</h2>
        <Notification />
    </React.Fragment>
);

const _Message = () => (
    <React.Fragment>
        <h2>Message</h2>
        <Message />
    </React.Fragment>
);

const _Search = () => (
    <React.Fragment>
        <h2>Search</h2>
        <Search />
    </React.Fragment>
);

const _Setting = () => (
    <React.Fragment>
        <h2>Setting</h2>
        <Setting />
    </React.Fragment>
);

const _Debug = () => (
    <React.Fragment>
        <h2>Debug</h2>
        <Debug />
    </React.Fragment>
);

export default {
    Main: _Main, 
    Login: _Login, 
    User: _User, 
    Notification: _Notification,
    Message: _Message, 
    Search: _Search, 
    Setting: _Setting,
    Debug: _Debug
};