/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import {css, jsx} from '@emotion/core';
import { MyStoreType, SettingStoreType } from '../types';

interface AppTitleProps {
    store?: MyStoreType
    setting?: SettingStoreType
}

@inject('store', 'setting')
@observer
export default class AppTitle extends React.Component<AppTitleProps> {
    render() {
        const {store, setting} = this.props;
        const status = (store!.pcAState.connection === 'connected' && store!.pcAState.dataChannel === 'open') 
            || (store!.pcBState.connection === 'connected' && store!.pcBState.dataChannel === 'open') 
            || (store!.pcCState.connection === 'connected' && store!.pcCState.dataChannel === 'open');
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