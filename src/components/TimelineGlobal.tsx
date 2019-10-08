/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { css, jsx } from '@emotion/core';
import { UserStoreType, SayType, SayStoreType } from '../types';
import { Link } from 'react-router-dom';
import { history } from '../stores';
import { escapeHtml, getFullDateStr, Finder } from '../utils';

interface GlobalProps {
    user?: UserStoreType
    say?: SayStoreType
    likeClickHandler(say: SayType): void
    unLikeClickHandler(say: SayType): void
}

@inject('user', 'say')
@observer
export default class GlobalTL extends React.Component<GlobalProps> {
    render() {
        const {user, say} = this.props;
        const crntUser = user!.getUser;
        const timeline = [...say!.timeLine].sort((a, b) => {
            return b.date - a.date;
        });
        const child1 = timeline.map(e => {
            const name = Finder.findAuthorName(e.authorId);
            const alike = crntUser && e.like.find(ee => ee === crntUser!.serial) ? 
                <i className="material-icons" css={{cursor:'pointer'}} onClick={() => {
                    this.props.unLikeClickHandler(e)}}>favorite</i> :
                <i className="material-icons" css={{cursor:'pointer'}} onClick={() => {
                    this.props.likeClickHandler(e)}}>favorite_border</i>;
            const naLike = crntUser && e.like.find(ee => ee === crntUser!.serial) ? 
                <i className="material-icons">favorite</i> :
                <i className="material-icons">favorite_border</i>
            return <li key={e.id} css={{
                borderBottom:'solid 1px #ddd', padding:'6px', cursor:'pointer', '&:hover':{backgroundColor: '#eee'}
            }} onClick={(ev) => {
                ev.preventDefault();
                history.push({pathname:'/message', search:'?tgt=' + e.id});
            }}>
                <div css={{display:'flex', alignItems:'center'}}>
                    <Link to={{pathname:'/user', search: '?tgt=' + e.authorId}} css={{
                        display:'flex', alignItems:'center'
                    }} onClick={(ev) => {
                        ev.stopPropagation();
                    }}>
                        <img src={Finder.findAuthorIcon(e.authorId)} width="24" height="24" css={{
                            borderRadius:'20px', border:'solid 1px gray', margin: '4px'}}  />
                        <span css={{margin:'0px 4px'}}>{name !== 'no_name' ? name : e.author}</span>
                    </Link>
                    <span css={{color:'#999', fontSize:'13px', margin:'0px 4px'}}>{getFullDateStr(e.date)}</span>
                </div>
                <div css={{marginLeft:'22px', padding:'6px'}}>
                    <span dangerouslySetInnerHTML={{__html: escapeHtml(e.say).replace('\n', '<br/>')}}></span>
                </div>
                <div css={{display:'flex', justifyContent:'space-around', fontSize:'11px', color:'#999'}}>
                    <div css={{display:'flex', alignItems:'center', cursor:'initial'}} onClick={(ev) => {
                        ev.stopPropagation();
                    }}>
                        <i className="material-icons">message</i>
                        <span>reply:{e.reply.length}</span>
                    </div>
                    <div css={{display:'flex', alignItems:'center', cursor:'initial'}} onClick={(ev) => {
                        ev.stopPropagation();
                    }}>
                        {user!.logged && crntUser && crntUser.serial !== e.authorId ? alike : naLike}
                        <span>like:{e.like.length}</span>
                    </div>
                </div>
            </li>
        });
        return <div css={{width:user!.logged ? '48%':'100%'}}>
            <h4 css={{margin:'2px 0px'}}>global timeline</h4>
            <ul css={{listStyleType:'none', padding:'0px'}}>{child1}</ul>
        </div>
    }
}