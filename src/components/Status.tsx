/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import {css, jsx} from '@emotion/core';
import { clientId } from '../stores'
import { MyStoreType } from '../types';

interface PcStatusProps {
    store?: MyStoreType
}

@inject('store')
@observer
class PcStatus extends React.Component<PcStatusProps> {
    render() {
        const {store} = this.props;
        return <ul css={{fontSize:'13px', marginTop:'2px'}}>
            <li>pcA:{store!.pcAState.target} [{store!.pcAState.connection}] [{store!.pcAState.dataChannel}]</li>
            <li>pcB:{store!.pcBState.target} [{store!.pcBState.connection}] [{store!.pcBState.dataChannel}]</li>
            <li>pcC:{store!.pcCState.target} [{store!.pcCState.connection}] [{store!.pcCState.dataChannel}]</li>
        </ul>
    }
}

interface StatusProps {
    store?: MyStoreType
}

@inject('store')
@observer
export default class Status extends React.Component<StatusProps> {
    render() {
        const {store} = this.props;
        return <React.Fragment>
            <div css={{display:store!.showDetail ? 'block':'none'}}>
                <h2 css={{margin:'2px 0px'}}>status</h2>
                <h4 css={{margin:'4px 0px'}}>id:{clientId || 'no id'}</h4>
                <PcStatus />
            </div>
        </React.Fragment>
    }
}