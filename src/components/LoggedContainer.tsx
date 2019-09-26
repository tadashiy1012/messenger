/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import {css, jsx} from '@emotion/core';
import { MyStoreType } from '../store';
import Logout from './Logout';

interface LoggedContainerProps {
    store?: MyStoreType
}

@inject('store')
@observer
export default class LoggedContainer extends React.Component<LoggedContainerProps> {
    render() {
        const {store} = this.props;
        return <React.Fragment>
            <Logout />
            <span> </span>
            <button className="pure-button" onClick={(ev) => {
                store!.setShowSetting(!store!.showSetting);
            }}>settings</button>
        </React.Fragment>
    }
}