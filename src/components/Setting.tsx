/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import {css, jsx} from '@emotion/core';
import { MyStoreType } from '../store';

interface SettingProps {
    store?: MyStoreType
}

@inject('store')
@observer
export default class Setting extends React.Component<SettingProps> {
    render() {
        return <React.Fragment>
            
        </React.Fragment>
    }
}