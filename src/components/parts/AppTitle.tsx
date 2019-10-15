/** @jsx jsx */
import * as React from 'react';
import {css, jsx} from '@emotion/core';
import { SettingStoreType, ConnStateStoreType } from '../../types';

const bodyStyle = css({margin:'8px 0px'});
const inlineStyle = css({display:'inline'});
const leftPadding = css({paddingLeft:'22px'});

export default function AppTitle({conn, setting}: {conn?: ConnStateStoreType, setting?: SettingStoreType}) {
    const clickHandeler = (ev: React.MouseEvent) => {
        ev.preventDefault();
        setting!.setShowDetail(!setting!.showDetail);
    };
    const status = (conn!.pcAState.connection === 'connected' && conn!.pcAState.dataChannel === 'open') 
        || (conn!.pcBState.connection === 'connected' && conn!.pcBState.dataChannel === 'open') 
        || (conn!.pcCState.connection === 'connected' && conn!.pcCState.dataChannel === 'open');
    return <div css={bodyStyle}>
        <h1 css={inlineStyle}>messenger</h1>
        <span css={leftPadding}></span>
        <h3 css={inlineStyle}>status:<span>{status ? 'online':'offline'}</span></h3>
        <span css={leftPadding}></span>
        <a href="#" onClick={clickHandeler}>show/hide status detail</a>
    </div>
}