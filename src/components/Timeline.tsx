/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import {css, jsx} from '@emotion/core';
import { MyStoreType, SayType, SettingStoreType } from '../types';
import Writer from './Writer';
import GlobalTL from './TimelineGlobal';
import LocalTL from './TimelineLocal';

interface TimeLineProps {
    store?: MyStoreType
    setting?: SettingStoreType
}

@inject('store', 'setting')
@observer
export default class TimeLine extends React.Component<TimeLineProps> {
    likeClickHandler(tgt: SayType) {
        const {store} = this.props;
        store!.updateUserLike(tgt).catch(err => console.error(err));
    }
    unLikeClickHandler(tgt: SayType) {
        const {store} = this.props;
        store!.updateUserUnLike(tgt).catch(err => console.error(err));
    }
    messageClickHandler(tgt: SayType) {
        const {setting} = this.props;
        setting!.setShowMessageTarget(tgt.id);
    }
    render() {
        const {store} = this.props;
        const writer = store!.logged ? <Writer /> : null;
        return <React.Fragment>
            {writer}
            <div css={{display:'flex', flexDirection:'row', justifyContent:'space-between'}}>
                <GlobalTL likeClickHandler={this.likeClickHandler.bind(this)} 
                    unLikeClickHandler={this.unLikeClickHandler.bind(this)}
                    messageClickHandler={this.messageClickHandler.bind(this)} />
                <LocalTL likeClickHandler={this.likeClickHandler.bind(this)}
                    unLikeClickHandler={this.unLikeClickHandler.bind(this)}
                    messageClickHandler={this.messageClickHandler.bind(this)} /> 
            </div>
        </React.Fragment>
    }
}