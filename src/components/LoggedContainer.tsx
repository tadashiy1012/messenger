/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import {css, jsx} from '@emotion/core';
import { MyStoreType } from '../store';
import Logout from './Logout';

interface LoggedContainerProps {
    store?: MyStoreType
}

export default class LoggedContainer extends React.Component<LoggedContainerProps> {
    render() {
        return <React.Fragment>
            <Logout />
            <span> </span>
            <button className="pure-button">settings</button>
        </React.Fragment>
    }
}