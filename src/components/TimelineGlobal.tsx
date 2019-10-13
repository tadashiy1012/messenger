/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { jsx } from '@emotion/core';
import { UserStoreType, SayType, SayStoreType } from '../types';
import { Finder } from '../utils';
import Line from './Line';

interface GlobalProps {
    user?: UserStoreType
    say?: SayStoreType
    likeClickHandler(say: SayType): void
    unLikeClickHandler(say: SayType): void
}

interface GlobalState {
    index: number
}

@inject('user', 'say')
@observer
export default class GlobalTL extends React.Component<GlobalProps, GlobalState> {
    constructor(props: Readonly<GlobalProps>) {
        super(props);
        this.state = {
            index: 10
        };
    }
    makeChild(src: SayType[]) {
        const {user} = this.props;
        const crntUser = user!.getUser;
        return src.map(e => {
            const name = Finder.findAuthorName(e.authorId);
            const icon = Finder.findAuthorIcon(e.authorId);
            const alike = crntUser && e.like.find(ee => ee === crntUser!.serial) ? 
                <i className="material-icons" css={{cursor:'pointer'}} onClick={() => {
                    this.props.unLikeClickHandler(e)}}>favorite</i> :
                <i className="material-icons" css={{cursor:'pointer'}} onClick={() => {
                    this.props.likeClickHandler(e)}}>favorite_border</i>;
            const naLike = crntUser && e.like.find(ee => ee === crntUser!.serial) ? 
                <i className="material-icons">favorite</i> :
                <i className="material-icons">favorite_border</i>
            const like = user!.logged && crntUser && crntUser.serial !== e.authorId ? alike : naLike;
            return <Line key={e.id} name={name} authorIcon={icon} say={e} likeIcon={like} />
        });
    }
    render() {
        const {user, say} = this.props;
        const tl = [...say!.timeLine].reverse().slice(0, this.state.index);
        return <div css={{width:user!.logged ? '48%':'100%'}}>
            <h4 css={{margin:'2px 0px'}}>global timeline</h4>
            <ul css={{listStyleType:'none', padding:'0px'}}>{this.makeChild(tl)}</ul>
            <div css={{display:'flex', justifyContent:'center'}}>
                <button className="pure-button" onClick={() => {
                    this.setState({index: this.state.index + 10});
                }}>view more</button>
            </div>
        </div>
    }
}