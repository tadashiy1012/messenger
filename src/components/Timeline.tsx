/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import {css, jsx} from '@emotion/core';
import { MyStoreType } from '../store';

interface TimeLineProps {
    store?: MyStoreType
}

@inject('store')
@observer
export default class TimeLine extends React.Component<TimeLineProps> {
    render() {
        const {store} = this.props;
        const child = store!.timeLine.reverse().map(e => {
            return <li key={e.id}>
                <span>{e.author}</span>
                <span>:</span>
                <span>{e.say}</span>
            </li>
        });
        return <ul>{child}</ul>
    }
}