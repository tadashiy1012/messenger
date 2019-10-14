/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { jsx } from '@emotion/core';
import { history } from '../../stores';
import { UserStoreType, SayType, SayStoreType, SettingStoreType } from '../../types';
import { noImage, Finder } from '../../utils';
import uuid = require('uuid');
import { Line } from '../parts';

interface ReplyWriterProps {
    user?: UserStoreType
    say?: SayStoreType
    tgtSay?: SayType
}

function ReplyWriter({user, say, tgtSay}: ReplyWriterProps) {
    const _inSayRef: React.RefObject<HTMLTextAreaElement> = React.createRef();
    const sendClickHandler = () => {
        console.log(_inSayRef.current!.value);
        if (user && user.currentUser && say && tgtSay) {
            const {serial, name} = user.currentUser;
            const newSay: SayType = {
                id: uuid.v1(),
                date: Date.now(),
                author: name,
                authorId: serial,
                like: [],
                reply: [],
                say: _inSayRef.current!.value
            };
            say.addSay(newSay);
            tgtSay.reply.push(newSay.id);
            say.updateSay(tgtSay).catch((err) => {
                console.error(err);
                alert('say send fail!!');
            })
        } else {
            alert('say send fail!!');
        }
    }
    return <React.Fragment>
        <div className="pure-form" css={{display:'flex', alignItems:'center', margin:'14px 0px'}}>
            <img src={user!.currentUser ? user!.currentUser.icon : noImage} width="32" height="32" css={{
                borderRadius:'20px', border:'solid 1px gray', margin:'0px 4px'}} />
            <span>{user!.currentUser ? user!.currentUser.name : 'no_name'}'s reply: </span>
            <textarea className="pure-input pure-input-1-3"
                css={{margin:'0px 4px'}}
                ref={_inSayRef} disabled={user!.logged ? false:true}></textarea>
            <button className="pure-button" 
                onClick={() => {sendClickHandler()}} 
                disabled={user!.logged ? false : true}>send</button>
        </div>
    </React.Fragment>
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
        const {user, setting, say} = this.props;
        const tgt = setting!.showMessageTarget;
        const tgtSay = Finder.findSay(tgt!);
        const crntUser = user!.getUser;
        let contents = null;
        if (tgtSay) {
            let reply = null;
            if (user!.logged) {
                reply = <ReplyWriter tgtSay={tgtSay} user={user} say={say} />
            }
            const alike = crntUser && tgtSay.like.find(ee => ee === crntUser!.serial) ? 
                <i className="material-icons" css={{cursor:'pointer'}} onClick={() => {
                    this.unLikeClickHandler(tgtSay)}}>favorite</i> :
                <i className="material-icons" css={{cursor:'pointer'}} onClick={() => {
                    this.likeClickHandler(tgtSay)}}>favorite_border</i>;
            const naLike = crntUser && tgtSay.like.find(ee => ee === crntUser!.serial) ? 
                <i className="material-icons">favorite</i> :
                <i className="material-icons">favorite_border</i>;
            const child = tgtSay.reply.map(e => {
                const s = Finder.findSay(e);
                if (s) {
                    const sname = Finder.findAuthorName(s.authorId);
                    const sicon = Finder.findAuthorIcon(s.authorId);
                    const slike = user!.logged && crntUser && crntUser.serial !== s.authorId ? alike : naLike;
                    return <Line key={s.id} name={sname} authorIcon={sicon} say={s} likeIcon={slike} />
                } else {
                    return null;
                }
            })
            const name = Finder.findAuthorName(tgtSay.authorId);
            const icon = Finder.findAuthorIcon(tgtSay.authorId);
            const like = user!.logged && crntUser && crntUser.serial !== tgtSay.authorId ? alike : naLike;
            contents = <React.Fragment>
                {reply}
                <ul css={{listStyleType:'none', paddingLeft:0}}>
                    <Line name={name} authorIcon={icon} say={tgtSay} likeIcon={like} />
                </ul>
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
        const {setting} = this.props;
        if (history) {
            const params = history.location.search.substring(1).split('&');
            if (params.length > 0) {
                const tgtId = params[0].split('=')[1];
                setting!.setShowMessageTarget(tgtId);
            }
        }
    }
}