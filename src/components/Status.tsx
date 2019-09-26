/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import {css, jsx} from '@emotion/core';
import { MyStoreType } from '../store';

interface PcStatusProps {
    store?: MyStoreType
}

@inject('store')
@observer
class PcStatus extends React.Component<PcStatusProps> {
    render() {
        const {store} = this.props;
        return <ul css={{fontSize:'13px', marginTop:'2px'}}>
            <li>pcA:{store!.pcAtgtId} [{store!.pcAState}] [{store!.dcAState}]</li>
            <li>pcB:{store!.pcBtgtId} [{store!.pcBState}] [{store!.dcBState}]</li>
            <li>pcC:{store!.pcCtgtId} [{store!.pcCState}] [{store!.dcCState}]</li>
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
                <h2 css={{marginBottom:'2px'}}>status</h2>
                <h4 css={{margin:'4px 0px'}}>id:{store!.id || 'no id'}</h4>
                <PcStatus />
            </div>
        </React.Fragment>
    }
}