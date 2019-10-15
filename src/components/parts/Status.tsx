/** @jsx jsx */
import * as React from 'react';
import {css, jsx} from '@emotion/core';
import { clientId } from '../../stores'
import { ConnStateStoreType } from '../../types';

const ulStyle = css({fontSize:'13px', marginTop:'2px'});
const h2Style = css({margin:'2px 0px'});
const h4Style = css({margin:'4px 0px'});

interface PcStatusProps {
    conn?: ConnStateStoreType
}

const PcStatus = ({conn}: PcStatusProps) => (
    <ul css={ulStyle}>
        <li>pcA:{conn!.pcAState.target} [{conn!.pcAState.connection}] [{conn!.pcAState.dataChannel}]</li>
        <li>pcB:{conn!.pcBState.target} [{conn!.pcBState.connection}] [{conn!.pcBState.dataChannel}]</li>
        <li>pcC:{conn!.pcCState.target} [{conn!.pcCState.connection}] [{conn!.pcCState.dataChannel}]</li>
    </ul>
);

interface StatusProps {
    conn?: ConnStateStoreType
    showDetail: Boolean
}

export default function Status({conn, showDetail}: StatusProps) {
    return <div css={{display:showDetail ? 'block':'none'}}>
        <h2 css={h2Style}>status</h2>
        <h4 css={h4Style}>id:{clientId || 'no id'}</h4>
        <PcStatus conn={conn} />
    </div>
}