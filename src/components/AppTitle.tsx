/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import {css, jsx} from '@emotion/core';
import { MyStoreType, SettingStoreType, ConnStateStoreType } from '../types';

interface AppTitleProps {
    store?: MyStoreType
    setting?: SettingStoreType
    conn?: ConnStateStoreType
}

@inject('store', 'setting', 'conn')
@observer
export default class AppTitle extends React.Component<AppTitleProps> {
    render() {
        const {setting, conn} = this.props;
        const status = (conn!.pcAState.connection === 'connected' && conn!.pcAState.dataChannel === 'open') 
            || (conn!.pcBState.connection === 'connected' && conn!.pcBState.dataChannel === 'open') 
            || (conn!.pcCState.connection === 'connected' && conn!.pcCState.dataChannel === 'open');
        return <div css={{margin:'8px 0px'}}>
            <h1 css={{display:'inline'}}>messenger</h1>
            <span css={{paddingLeft:'22px'}}></span>
            <h3 css={{display:'inline'}}>status:<span>{status ? 'online':'offline'}</span></h3>
            <span css={{paddingLeft:'22px'}}></span>
            <a href="#" onClick={(ev) => {
                ev.preventDefault();
                setting!.setShowDetail(!setting!.showDetail);
            }}>show/hide status detail</a>
        </div>
    }
}