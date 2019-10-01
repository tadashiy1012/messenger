/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import {css, jsx} from '@emotion/core';
import { MyStoreType } from '../types';
import Logout from './Logout';
import { ShowMode } from '../enums';

interface LoggedContainerProps {
    store?: MyStoreType
}

@inject('store')
@observer
export default class LoggedContainer extends React.Component<LoggedContainerProps> {
    render() {
        const {store} = this.props;
        return <React.Fragment>
            <button className="pure-button" onClick={(ev) => {
                store!.setShowMode(ShowMode.MAIN);
            }}>main</button>
            <span> </span>
            <button className="pure-button" onClick={(ev) => {
                store!.setShowMode(ShowMode.SETTING);
            }}>setting</button>
            <span> </span>
            <button className="pure-button" onClick={(ev) => {
                store!.setShowMode(ShowMode.FOLLOW);
            }}>follow/follower</button>
            <span> </span>
            <Logout />
        </React.Fragment>
    }
}