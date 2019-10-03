/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import {css, jsx} from '@emotion/core';
import { MyStoreType } from '../types';
import { ShowMode } from '../enums';
import escape_html from '../utils/escapeHtml';

interface UserProps {
    store?: MyStoreType
    location?: any
}

@inject('store')
@observer
export default class User extends React.Component<UserProps> {
    constructor(props: Readonly<UserProps>) {
        super(props);
    }
    render() {
        const {store} = this.props;
        console.log(store!.getHistory!.location);
        const tgtParam = store!.getHistory!.location.search.split('=')[1];
        console.log(tgtParam);
        if (!store!.showUserTarget) store!.setShowUserTarget(tgtParam);
        console.log(store!.showUserTarget);
        const u = store!.findUser(store!.showUserTarget);
        console.log(u);
        return <p>{u ? u.name : 'null'}</p>
    }
}