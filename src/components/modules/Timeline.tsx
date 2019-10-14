/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import {css, jsx} from '@emotion/core';
import { UserStoreType, SayType } from '../../types';
import { Writer, GlobalTL, LocalTL } from '../parts';

interface TimeLineProps {
    user?: UserStoreType
}

@inject('user')
@observer
export default class TimeLine extends React.Component<TimeLineProps> {
    likeClickHandler(tgt: SayType) {
        const {user} = this.props;
        user!.updateUserLike(tgt).catch(err => console.error(err));
    }
    unLikeClickHandler(tgt: SayType) {
        const {user} = this.props;
        user!.updateUserUnLike(tgt).catch(err => console.error(err));
    }
    render() {
        const {user} = this.props;
        const writer = user!.logged ? <Writer /> : null;
        return <React.Fragment>
            {writer}
            <div css={{display:'flex', flexDirection:'row', justifyContent:'space-between'}}>
                <GlobalTL likeClickHandler={this.likeClickHandler.bind(this)} 
                    unLikeClickHandler={this.unLikeClickHandler.bind(this)} />
                <LocalTL likeClickHandler={this.likeClickHandler.bind(this)}
                    unLikeClickHandler={this.unLikeClickHandler.bind(this)} /> 
            </div>
        </React.Fragment>
    }
}