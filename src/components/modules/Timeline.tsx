/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import {css, jsx} from '@emotion/core';
import { UserStoreType, SayStoreType } from '../../types';
import { Writer, GlobalTL, LocalTL } from '../parts';

const divStyle = css({display:'flex', flexDirection:'row', justifyContent:'space-between'});

interface TimeLineProps {
    user?: UserStoreType
    say?: SayStoreType
}

interface TimeLineState {
    gtlNum: number
    ltlNum: number
}

@inject('user', 'say')
@observer
export default class TimeLine extends React.Component<TimeLineProps, TimeLineState> {
    constructor(props: Readonly<TimeLineProps>) {
        super(props);
        this.state = {
            gtlNum: 10,
            ltlNum: 10
        };
    }
    gtlNumUp() {
        this.setState({gtlNum: this.state.gtlNum + 10});
    }
    ltlNumUp() {
        this.setState({ltlNum: this.state.ltlNum + 10});
    }
    render() {
        const {user, say} = this.props;
        const writer = user!.logged ? <Writer /> : null;
        return <React.Fragment>
            {writer}
            <div css={divStyle}>
                <GlobalTL user={user} timeline={say!.timeLine} num={this.state.gtlNum} numUp={this.gtlNumUp.bind(this)} />
                <LocalTL user={user} timeline={say!.timeLine} num={this.state.ltlNum} numUp={this.ltlNumUp.bind(this)} /> 
            </div>
        </React.Fragment>
    }
}