/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import {css, jsx} from '@emotion/core';
import { clientId } from '../../stores'
import { SettingStoreType, ConnStateStoreType } from '../../types';

interface PcStatusProps {
    conn?: ConnStateStoreType
}

@inject('conn')
@observer
class PcStatus extends React.Component<PcStatusProps> {
    render() {
        const {conn} = this.props;
        return <ul css={{fontSize:'13px', marginTop:'2px'}}>
            <li>pcA:{conn!.pcAState.target} [{conn!.pcAState.connection}] [{conn!.pcAState.dataChannel}]</li>
            <li>pcB:{conn!.pcBState.target} [{conn!.pcBState.connection}] [{conn!.pcBState.dataChannel}]</li>
            <li>pcC:{conn!.pcCState.target} [{conn!.pcCState.connection}] [{conn!.pcCState.dataChannel}]</li>
        </ul>
    }
}

interface StatusProps {
    setting?: SettingStoreType
}

@inject('setting')
@observer
export default class Status extends React.Component<StatusProps> {
    render() {
        const {setting} = this.props;
        return <React.Fragment>
            <div css={{display:setting!.showDetail ? 'block':'none'}}>
                <h2 css={{margin:'2px 0px'}}>status</h2>
                <h4 css={{margin:'4px 0px'}}>id:{clientId || 'no id'}</h4>
                <PcStatus />
            </div>
        </React.Fragment>
    }
}