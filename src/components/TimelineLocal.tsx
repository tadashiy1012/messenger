/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import {css, jsx} from '@emotion/core';
import { MyStoreType, SayType } from '../types';
import escape_html from '../utils/escapeHtml';
import { Link } from 'react-router-dom';

interface LocalProps {
    store?: MyStoreType
    likeClickHandler(say: SayType): void
    unLikeClickHandler(say: SayType): void
    messageClickHandler(say: SayType): void
}

@inject('store')
@observer
export default class LocalTL extends React.Component<LocalProps> {
    render() {
        const {store} = this.props;
        const user = store!.getUser;
        const timeline = [...store!.timeLine].sort((a, b) => {
            return b.date - a.date;
        });
        const idSet = store!.logged ? 
            new Set<string>([
                store!.currentUser.serial, 
                ...store!.currentUser.follow
            ]) : new Set<string>();
        const ids: Array<String> = Array.from(idSet);
        const child2 = timeline.filter(e => {
            const found = ids.find(ee => ee === e.authorId);
            return found ? true:false;
        }).map(e => {
            const dt = new Date(e.date);
            const name = store!.findAuthorname(e.authorId);
            const alike = user && e.like.find(ee => ee === user!.serial) ? 
                <i className="material-icons" css={{cursor:'pointer'}} onClick={() => {
                    this.props.unLikeClickHandler(e)}}>favorite</i> :
                <i className="material-icons" css={{cursor:'pointer'}} onClick={() => {
                    this.props.likeClickHandler(e)}}>favorite_border</i>;
            const naLike = user && e.like.find(ee => ee === user!.serial) ? 
                <i className="material-icons">favorite</i> :
                <i className="material-icons">favorite_border</i>;
            return <li key={e.id} css={{borderBottom:'solid 1px #ddd', padding:'6px'}} >
                <div css={{display:'flex', alignItems:'center'}}>
                    <Link to={{pathname:'/user', search: '?tgt=' + e.authorId}}>
                        <img src={store!.findAuthorIcon(e.authorId)} width="24" height="24" css={{
                            borderRadius:'20px', border:'solid 1px gray', margin: '4px'}}  />
                    </Link>
                    <span css={{margin:'0px 4px'}}>{name !== 'no_name' ? name : e.author}</span>
                    <span css={{color:'#999', fontSize:'13px', margin:'0px 4px'}}>
                        {dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate() + ' ' + dt.getHours() + ':' + dt.getMinutes()}
                    </span>
                </div>
                <div css={{marginLeft:'22px', padding:'6px'}}>
                    <span dangerouslySetInnerHTML={{__html: escape_html(e.say).replace('\n', '<br/>')}}></span>
                </div>
                <div css={{display:'flex', justifyContent:'space-around', fontSize:'11px', color:'#999'}}>
                    <div css={{display:'flex', alignItems:'center'}}>
                        <i className="material-icons">message</i>
                        <span>reply:{e.reply.length}</span>
                    </div>
                    <div css={{display:'flex', alignItems:'center'}}>
                        {store!.logged && user && user.serial !== e.authorId ? alike : naLike}
                        <span>like:{e.like.length}</span>
                    </div>
                </div>
            </li>
        });
        return <div css={{width:'48%', display:store!.logged ? 'block':'none'}}>
            <h4 css={{margin:'2px 0px'}}>local timeline</h4>
            <ul css={{listStyleType:'none', padding:'0px'}}>{child2}</ul>
        </div>
    }
}