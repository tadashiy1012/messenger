/** @jsx jsx */
import * as React from 'react';
import { Link } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import { css, jsx } from '@emotion/core';
import { history } from '../stores';
import { UserStoreType, SayType, SayStoreType, SettingStoreType } from '../types';
import { escapeHtml, getFullDateStr, noImage } from '../utils';
import uuid = require('uuid');

interface ReplyWriterProps {
    user?: UserStoreType
    say?: SayStoreType
    tgtSay?: SayType
}

@inject('user', 'say')
@observer
class ReplyWriter extends React.Component<ReplyWriterProps> {
    private _inSayRef: React.RefObject<HTMLTextAreaElement>;
    constructor(props: Readonly<ReplyWriterProps>) {
        super(props);
        this._inSayRef = React.createRef();
    }
    sendClickHandler(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        console.log(this._inSayRef.current!.value);
        const {user, say, tgtSay} = this.props;
        if (user && user.currentUser && say && tgtSay) {
            const {serial, name} = user.currentUser;
            const newSay: SayType = {
                id: uuid.v1(),
                date: Date.now(),
                author: name,
                authorId: serial,
                like: [],
                reply: [],
                say: this._inSayRef.current!.value
            };
            say.addSay(newSay).catch((err) => {
                console.error(err);
                alert('say send fail!!');
            });
            tgtSay.reply.push(newSay.id);
            say.updateSay(tgtSay).catch((err) => {
                console.error(err);
                alert('say send fail!!');
            })
        } else {
            alert('say send fail!!');
        }
    }
    render() {
        const {user} = this.props;
        return <React.Fragment>
            <div className="pure-form" css={{display:'flex', alignItems:'center', margin:'14px 0px'}}>
                <img src={user!.currentUser ? user!.currentUser.icon : noImage} width="32" height="32" css={{
                    borderRadius:'20px', border:'solid 1px gray', margin:'0px 4px'}} />
                <span>{user!.currentUser ? user!.currentUser.name : 'no_name'}'s reply: </span>
                <textarea className="pure-input pure-input-1-3"
                    css={{margin:'0px 4px'}}
                    ref={this._inSayRef} disabled={user!.logged ? false:true}></textarea>
                <button className="pure-button" 
                    onClick={(ev) => {this.sendClickHandler(ev)}} 
                    disabled={user!.logged ? false : true}>send</button>
            </div>
        </React.Fragment>
    }
}

interface MessageProps {
    user?: UserStoreType
    say?: SayStoreType
    setting?: SettingStoreType
}

@inject('user', 'say', 'setting')
@observer
export default class Message extends React.Component<MessageProps> {
    likeClickHandler(tgt: SayType) {
        const {user} = this.props;
        user!.updateUserLike(tgt).catch(err => console.error(err));
    }
    unLikeClickHandler(tgt: SayType) {
        const {user} = this.props;
        user!.updateUserUnLike(tgt).catch(err => console.error(err));
    }
    render() {
        const {user, setting} = this.props;
        const tgt = setting!.showMessageTarget;
        const tgtSay = user!.findSay(tgt!);
        const crntUser = user!.getUser;
        let contents = null;
        if (tgtSay) {
            let reply = null;
            if (user!.logged) {
                reply = <ReplyWriter tgtSay={tgtSay} />
            }
            const name = user!.findAuthorName(tgtSay.authorId);
            const alike = crntUser && tgtSay.like.find(ee => ee === crntUser!.serial) ? 
                <i className="material-icons" css={{cursor:'pointer'}} onClick={() => {
                    this.unLikeClickHandler(tgtSay)}}>favorite</i> :
                <i className="material-icons" css={{cursor:'pointer'}} onClick={() => {
                    this.likeClickHandler(tgtSay)}}>favorite_border</i>;
            const naLike = crntUser && tgtSay.like.find(ee => ee === crntUser!.serial) ? 
                <i className="material-icons">favorite</i> :
                <i className="material-icons">favorite_border</i>;
            const child = tgtSay.reply.map(e => {
                const s = user!.findSay(e);
                if (s) {
                    const sname = user!.findAuthorName(s.authorId);
                    return <li key={s.id} css={{margin:'12px 0px', borderBottom:'solid 1px #ddd', padding:'6px'}}>
                        <div css={{display:'flex', alignItems:'center'}}>
                            <Link to={{pathname:'/user', search: '?tgt=' + s.authorId}} css={{
                                display:'flex', alignItems:'center'
                            }}>
                                <img src={user!.findAuthorIcon(s.authorId)} width="24" height="24" css={{
                                    borderRadius:'20px', border:'solid 1px gray', margin: '4px'}}  />
                                <span css={{margin:'0px 4px'}}>{sname !== 'no_name' ? sname : s.author}</span>
                            </Link>
                            <span css={{color:'#999', fontSize:'13px', margin:'0px 4px'}}>{getFullDateStr(s.date)}</span>
                            <div css={{display:'flex', alignItems:'center', fontSize:'11px', color:'#999', margin:'0px 14px'}}>
                                <i className="material-icons">message</i>
                                <span>reply:{s.reply.length}</span>
                            </div>
                            <div css={{display:'flex', alignItems:'center', fontSize:'11px', color:'#999'}}>
                                {user!.logged && crntUser && crntUser.serial !== s.authorId ? alike : naLike}
                                <span>like:{s.like.length}</span>
                            </div>
                        </div>
                        <div css={{marginLeft:'22px', padding:'6px'}}>
                            <span dangerouslySetInnerHTML={{__html: escapeHtml(s.say).replace('\n', '<br/>')}}></span>
                        </div>
                    </li>
                } else {
                    return null;
                }
            })
            contents = <React.Fragment>
                {reply}
                <div css={{borderBottom:'solid 1px #ddd', padding:'6px'}}>
                    <div css={{display:'flex', alignItems:'center'}}>
                        <Link to={{pathname:'/user', search: '?tgt=' + tgtSay.authorId}} css={{
                            display:'flex', alignItems:'center'
                        }}>
                            <img src={user!.findAuthorIcon(tgtSay.authorId)} width="24" height="24" css={{
                                borderRadius:'20px', border:'solid 1px gray', margin: '4px'}}  />
                            <span css={{margin:'0px 4px'}}>{name !== 'no_name' ? name : tgtSay.author}</span>
                        </Link>
                        <span css={{color:'#999', fontSize:'13px', margin:'0px 4px'}}>{getFullDateStr(tgtSay.date)}</span>
                        <div css={{display:'flex', alignItems:'center', fontSize:'11px', color:'#999', margin:'0px 14px'}}>
                            <i className="material-icons">message</i>
                            <span>reply:{tgtSay.reply.length}</span>
                        </div>
                        <div css={{display:'flex', alignItems:'center', fontSize:'11px', color:'#999'}}>
                            {user!.logged && crntUser && crntUser.serial !== tgtSay.authorId ? alike : naLike}
                            <span>like:{tgtSay.like.length}</span>
                        </div>
                    </div>
                    <div css={{marginLeft:'22px', padding:'6px'}}>
                        <span dangerouslySetInnerHTML={{__html: escapeHtml(tgtSay.say).replace('\n', '<br/>')}}></span>
                    </div>
                </div>
                <ul css={{listStyleType:'none', paddingLeft:'12px'}}>
                    {child}
                </ul>
            </React.Fragment>
        } else {
            contents = <p>message not found</p>
        }
        return <React.Fragment>
            {contents}
        </React.Fragment>
    }
    componentDidMount() {
        const {user, setting} = this.props;
        if (history) {
            const params = history.location.search.substring(1).split('&');
            if (params.length > 0) {
                const tgtId = params[0].split('=')[1];
                setting!.setShowMessageTarget(tgtId);
            }
        }
        
    }
}