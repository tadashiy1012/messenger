/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import {css, jsx} from '@emotion/core';
import { MyStoreType } from '../store';

interface AppTitleProps {
    store?: MyStoreType
}

@inject('store')
@observer
export default class AppTitle extends React.Component<AppTitleProps> {
    render() {
        const {store} = this.props;
        const status = (store!.pcAState === 'connected' && store!.dcAState === 'open') 
            || (store!.pcBState === 'connected' && store!.dcBState === 'open') 
            || (store!.pcCState === 'connected' && store!.dcCState === 'open');
        return <div css={{margin:'8px 0px'}}>
            <h1 css={{display:'inline'}}>messenger</h1>
            <span css={{paddingLeft:'22px'}}></span>
            <h3 css={{display:'inline'}}>status:<span>{status ? 'online':'offline'}</span></h3>
            <span css={{paddingLeft:'22px'}}></span>
            <a href="#" onClick={(ev) => {
                ev.preventDefault();
                store!.setShowDetail(!store!.showDetail);
            }}>show/hide status detail</a>
        </div>
    }
}