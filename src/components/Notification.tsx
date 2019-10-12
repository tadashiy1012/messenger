/** @jsx jsx */
import React from "react";
import { css, jsx } from '@emotion/core';
import { Link } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import { UserStoreType, SayStoreType, SayType } from "types";
import { history } from '../stores';
import { Finder } from '../utils';

interface NotificationProps {
    user?: UserStoreType
    say?: SayStoreType
}

@inject('user', 'say')
@observer
export default class Notification extends React.Component<NotificationProps> {
    render() {
        const {user, say} = this.props;
        if (!user!.logged) {
            history.push('/');
        }
        let content = null;
        if (user!.currentUser) {
            let child = [];
            const newNotify = user!.currentUser.notify.filter(e => e[1] === true);
            const notNew = user!.currentUser.notify.filter(e => e[1] === false);
            const makeLi = (say: SayType | undefined) => {
                if (say) {
                    const author = Finder.findAuthorName(say.authorId);
                    return <li key={say.id}>
                        <p>{author}</p>
                        <p>{say.say}</p>
                    </li>
                } else {
                    return null;
                }
            };
            child.push(...newNotify.map(e => {
                const say = Finder.findSay(e[0]);
                return makeLi(say);
            }));
            child.push(...notNew.map(e => {
                const say = Finder.findSay(e[0]);
                return makeLi(say);
            }));
            content = <ul>{child}</ul>
        } else {
            content = <p>user not found</p>
        }
        return <React.Fragment>{content}</React.Fragment>
    }
}