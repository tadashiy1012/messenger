/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { jsx } from '@emotion/core';
import { UserStoreType, SayType, SayStoreType } from '../types';
import { Finder } from '../utils';
import Line from './Line';

interface LocalProps {
    user?: UserStoreType
    say?: SayStoreType
    likeClickHandler(say: SayType): void
    unLikeClickHandler(say: SayType): void
}

interface LocalState {
    index: number
}

@inject('user', 'say')
@observer
export default class LocalTL extends React.Component<LocalProps, LocalState> {
    constructor(props: Readonly<LocalProps>) {
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
                    this.props.likeClickHandler(e)}}>favorite_border</i>
            const naLike = crntUser && e.like.find(ee => ee === crntUser!.serial) ? 
                <i className="material-icons">favorite</i> :
                <i className="material-icons">favorite_border</i>
            const like = user!.logged && crntUser && crntUser.serial !== e.authorId ? alike : naLike;
            return <Line key={e.id} name={name} authorIcon={icon} say={e} likeIcon={like} />
        });
    }
    render() {
        const {user, say} = this.props;
        const idSet = user!.logged ? 
            new Set<string>([
                user!.currentUser.serial, 
                ...user!.currentUser.follow
            ]) : new Set<string>();
        const ids: Array<String> = Array.from(idSet);
        const timeline = [...say!.timeLine].filter(e => {
            const found = ids.find(ee => ee === e.authorId);
            return found ? true:false;
        }).reverse().slice(0, this.state.index);
        return <div css={{width:'48%', display:user!.logged ? 'block':'none'}}>
            <h4 css={{margin:'2px 0px'}}>local timeline</h4>
            <ul css={{listStyleType:'none', padding:'0px'}}>{this.makeChild(timeline)}</ul>
            <div css={{display:'flex', justifyContent:'center'}}>
                <button className="pure-button" onClick={() => {
                    this.setState({index: this.state.index + 10});
                }}>view more</button>
            </div>
        </div>
    }
}