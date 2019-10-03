/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import {css, jsx} from '@emotion/core';
import { MyStoreType, SayType } from '../types';
import { ShowMode } from '../enums';
import escape_html from '../utils/escapeHtml';

interface GlobalProps {
    store?: MyStoreType
    likeClickHandler(say: SayType): void
    unLikeClickHandler(say: SayType): void
}

@inject('store')
@observer
class GlobalTL extends React.Component<GlobalProps> {
    render() {
        const {store} = this.props;
        const user = store!.getUser;
        const timeline = [...store!.timeLine].sort((a, b) => {
            return b.date - a.date;
        });
        const child1 = timeline.map(e => {
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
            return <li key={e.id} css={{borderBottom:'solid 1px #ddd', padding:'6px'}}>
                <div css={{display:'flex', alignItems:'center'}}>
                    <a href="#" onClick={(ev) => {
                        ev.preventDefault();
                        store!.setShowUserTarget(e.authorId);
                        store!.setShowMode(ShowMode.USER);
                    }}>
                        <img src={store!.findAuthorIcon(e.authorId)} width="24" height="24" css={{
                            borderRadius:'20px', border:'solid 1px gray', margin: '4px'}}  />
                    </a>
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
        return <div css={{width:store!.logged ? '46%':'88%'}}>
            <h4>global timeline</h4>
            <ul css={{listStyleType:'none', padding:'0px'}}>{child1}</ul>
        </div>
    }
}

interface LocalProps {
    store?: MyStoreType
    likeClickHandler(say: SayType): void
    unLikeClickHandler(say: SayType): void
}

@inject('store')
@observer
class LocalTL extends React.Component<LocalProps> {
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
            return <li key={e.id} css={{borderBottom:'solid 1px #ddd', padding:'6px'}}>
                <div css={{display:'flex', alignItems:'center'}}>
                    <a href="#" onClick={(ev) => {
                        ev.preventDefault();
                        store!.setShowUserTarget(e.authorId);
                        store!.setShowMode(ShowMode.USER);
                    }}>
                        <img src={store!.findAuthorIcon(e.authorId)} width="24" height="24" css={{
                            borderRadius:'20px', border:'solid 1px gray', margin: '4px'}}  />
                    </a>
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
        return <div css={{width:'46%', display:store!.logged ? 'block':'none'}}>
            <h4>local timeline</h4>
            <ul css={{listStyleType:'none', padding:'0px'}}>{child2}</ul>
        </div>
    }
}

interface TimeLineProps {
    store?: MyStoreType
}

@inject('store')
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
    render() {
        return <div css={{display:'flex', flexDirection:'row', justifyContent:'space-around'}}>
            <GlobalTL likeClickHandler={this.likeClickHandler.bind(this)} unLikeClickHandler={this.unLikeClickHandler.bind(this)} />
            <LocalTL likeClickHandler={this.likeClickHandler.bind(this)} unLikeClickHandler={this.unLikeClickHandler.bind(this)} />
        </div>
    }
}