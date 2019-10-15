/** @jsx jsx */
import * as React from 'react';
import { jsx, css } from '@emotion/core';
import { Finder } from './';
import { UserStoreType, SayType } from '../types';
import { Line } from '../components/parts';

const pointer = css({cursor:'pointer'});

export default function makeTlChild(user: UserStoreType, src: SayType[]) {
    const crntUser = user!.getUser;
    return src.map(e => {
        const name = Finder.findAuthorName(e.authorId);
        const icon = Finder.findAuthorIcon(e.authorId);
        const unLikeClick = (ev: React.MouseEvent) => {
            ev.stopPropagation();
            user!.updateUserLike(e).catch(err => console.error(err));
        };
        const likeClick = (ev: React.MouseEvent) => {
            ev.stopPropagation();
            user!.updateUserUnLike(e).catch(err => console.error(err));
        };
        const alike = crntUser && e.like.find(ee => ee === crntUser!.serial) ? 
            <i className="material-icons" css={pointer} onClick={unLikeClick}>favorite</i> :
            <i className="material-icons" css={pointer} onClick={likeClick}>favorite_border</i>;
        const naLike = crntUser && e.like.find(ee => ee === crntUser!.serial) ? 
            <i className="material-icons">favorite</i> :
            <i className="material-icons">favorite_border</i>
        const like = user!.logged && crntUser && crntUser.serial !== e.authorId ? alike : naLike;
        return <Line key={e.id} name={name} authorIcon={icon} say={e} likeIcon={like} />
    });
}