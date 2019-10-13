/** @jsx jsx */
import React from "react";
import { css, jsx } from '@emotion/core';
import { Link } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import { UserStoreType, SayType } from "../types";
import { history } from '../stores';
import { Finder, getFullDateStr, escapeHtml } from '../utils';
import Line from "./Line";

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
        if (!user!.logged) {
            history.push('/');
        }
        let content = null;
        if (user!.currentUser) {
            const crntUser = user!.currentUser;
            const makeLi = (say: SayType | undefined, newLs?: Boolean) => {
                if (say) {
                    const author = Finder.findAuthorName(say.authorId);
                    const icon = Finder.findAuthorIcon(say.authorId);
                    const alike = crntUser && say.like.find(ee => ee === crntUser!.serial) ? 
                        <i className="material-icons" css={{cursor:'pointer'}} onClick={() => {
                            this.unLikeClickHandler(say);
                        }}>favorite</i> :
                        <i className="material-icons" css={{cursor:'pointer'}} onClick={() => {
                            this.likeClickHandler(say);
                        }}>favorite_border</i>
                    const naLike = crntUser && say.like.find(ee => ee === crntUser!.serial) ? 
                        <i className="material-icons">favorite</i> :
                        <i className="material-icons">favorite_border</i>
                    const like = user!.logged && crntUser && crntUser.serial !== say.authorId ? alike : naLike;
                    return <Line key={say.id} name={author} authorIcon={icon} say={say} likeIcon={like} />
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