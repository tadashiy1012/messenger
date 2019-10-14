/** @jsx jsx */
import React from "react";
import { jsx } from '@emotion/core';
import { UserType, SayType, UserStoreType } from "../../types";
import { Finder } from '../../utils';
import { history } from '../../stores';
import { Line } from '../parts';

interface ReplyProps {
    tgtUser: UserType
    user?: UserStoreType
}

export default function UserReply({tgtUser, user}: ReplyProps) {
    const likeClickHandler = (tgt: SayType) => {
        user!.updateUserLike(tgt).catch(err => console.error(err));
    }
    const unLikeClickHandler = (tgt: SayType) => {
        user!.updateUserUnLike(tgt).catch(err => console.error(err));
    }
    const crntUser = user!.currentUser;
    const userSays = Finder.findUserSaySync(tgtUser.serial);
    const src = Finder.searchReply(tgtUser.serial).map<[SayType, SayType[]]>(e => {
        const reply = userSays.filter(ee => e.reply.find(eee => eee === ee.id) !== undefined);
        return [e, reply];
    }).sort((a, b) => {
        return b[1][b[1].length - 1].date - a[1][a[1].length - 1].date;
    });
    const child = src.map(e => {
        const msg = e[0];
        const rep = e[1];
        const reply = rep.map(ee => {
            const rname = Finder.findAuthorName(ee.authorId);
            const ricon = Finder.findAuthorIcon(ee.authorId);
            const alike = crntUser && ee.like.find(eee => eee === crntUser!.serial) ? 
                <i className="material-icons" css={{cursor:'pointer'}} onClick={() => {
                    unLikeClickHandler(ee)}}>favorite</i> :
                <i className="material-icons" css={{cursor:'pointer'}} onClick={() => {
                    likeClickHandler(ee)}}>favorite_border</i>;
            const naLike = crntUser && ee.like.find(eee => eee === crntUser!.serial) ? 
                <i className="material-icons">favorite</i> :
                <i className="material-icons">favorite_border</i>;
            const like = user!.logged && crntUser && crntUser.serial !== ee.authorId ? alike : naLike;
            return <Line key={ee.id} name={rname} authorIcon={ricon} say={ee} likeIcon={like} />
        });
        const name = Finder.findAuthorName(msg.authorId);
        const icon = Finder.findAuthorIcon(msg.authorId);
        const naLike = <i className="material-icons">favorite</i>;
        return <li key={msg.id} css={{borderBottom:'solid 1px #ddd', padding:'6px'}}>
            <div css={{cursor:'pointer', '&:hover':{backgroundColor: '#eee'}}} onClick={() => {
                history.push({pathname:'/message', search:'?tgt=' + msg.id});
            }}>
                <ul css={{listStyleType:'none', paddingLeft:'0px'}}>
                    <Line name={name} authorIcon={icon} say={msg} likeIcon={naLike} />
                </ul>
            </div>
            <ul css={{listStyleType:'none', paddingLeft:'18px'}}>
                {reply}
            </ul>
        </li>
    });
    return <ul css={{listStyleType:'none', paddingLeft:'0px'}}>{child}</ul>
}