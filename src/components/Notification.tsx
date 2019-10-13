/** @jsx jsx */
import React from "react";
import { css, jsx } from '@emotion/core';
import { Link } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import { UserStoreType, SayType } from "../types";
import { history } from '../stores';
import { Finder, getFullDateStr, escapeHtml } from '../utils';

interface NotificationProps {
    user?: UserStoreType
}

@inject('user')
@observer
export default class Notification extends React.Component<NotificationProps> {
    unListen: any;
    constructor(props: Readonly<NotificationProps>) {
        super(props)
        const {user} = this.props;
        this.unListen = history.listen((location, action) => {
            if (location.pathname !== '/notification') {
                user!.updateUserNotify().catch(err => console.error(err));
            }
        });
    }
    render() {
        const {user} = this.props;
        if (!user!.logged) {
            history.push('/');
        }
        let content = null;
        if (user!.currentUser) {
            const makeLi = (say: SayType | undefined, newLs?: Boolean) => {
                if (say) {
                    const author = Finder.findAuthorName(say.authorId);
                    return <li key={say.id} css={{
                        margin:'12px 0px', borderBottom:'solid 1px #ddd', padding:'6px', cursor:'pointer', 
                        '&:hover':{backgroundColor: '#eee'}
                    }} onClick={() => {
                        history.push({pathname:'/message', search:'?tgt=' + say.id});
                    }}>
                        {newLs && <div>
                            <i className="material-icons" css={{color:'#777'}}>fiber_new</i>
                        </div>}
                        <div css={{display:'flex', alignItems:'center'}}>
                            <Link to={{pathname:'/user', search: '?tgt=' + say.authorId}} css={{
                                display:'flex', alignItems:'center'
                            }} onClick={(ev) => { ev.stopPropagation(); }}>
                                <img src={Finder.findAuthorIcon(say.authorId)} width="24" height="24" css={{
                                    borderRadius:'20px', border:'solid 1px gray', margin: '4px'}}  />
                                <span css={{margin:'0px 4px'}}>{author}</span>
                            </Link>
                            <span css={{color:'#999', fontSize:'13px', margin:'0px 4px'}}>{getFullDateStr(say.date)}</span>
                            <div css={{display:'flex', alignItems:'center', fontSize:'11px', color:'#999', margin:'0px 14px'}}>
                                <i className="material-icons">message</i>
                                <span>reply:{say.reply.length}</span>
                            </div>
                            <div css={{display:'flex', alignItems:'center', fontSize:'11px', color:'#999'}}>
                                <i className="material-icons">favorite</i>
                                <span>like:{say.like.length}</span>
                            </div>
                        </div>
                        <div css={{marginLeft:'22px', padding:'6px'}}>
                            <span dangerouslySetInnerHTML={{__html: escapeHtml(say.say).replace('\n', '<br/>')}}></span>
                        </div>
                    </li>
                } else {
                    return null;
                }
            };
            let child = [];
            const newNotify = user!.currentUser.notify.filter(e => e[1] === true);
            const notNew = user!.currentUser.notify.filter(e => e[1] === false);
            child.push(...newNotify.map(e => {
                const say = Finder.findSay(e[0]);
                return makeLi(say, true);
            }).reverse());
            child.push(...notNew.map(e => {
                const say = Finder.findSay(e[0]);
                return makeLi(say);
            }).reverse());
            content = <ul css={{listStyleType:'none', paddingLeft:'0px'}}>{child}</ul>
        } else {
            content = <p>user not found</p>
        }
        return <React.Fragment>{content}</React.Fragment>
    }
    componentWillUnmount() {
        this.unListen();
    }
}