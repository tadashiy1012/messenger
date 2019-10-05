/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import {css, jsx} from '@emotion/core';
import { UserStoreType } from '../types';

interface LogoutProps {
    user?: UserStoreType
}

@inject('user')
@observer
export default class Logout extends React.Component<LogoutProps> {
    logoutClickHandler() {
        this.props.user!.logout().catch((err) => console.error(err));
    }
    render() {
        return <button className="pure-button" onClick={() => {this.logoutClickHandler()}}>logout</button>
    }
}