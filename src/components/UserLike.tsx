/** @jsx jsx */
import React from "react";
import { jsx } from '@emotion/core';
import { Finder } from '../utils';
import Line from "./Line";

interface LikeProps {
    like: string[]
}

export default function UserLike({like}: LikeProps) {
    const child = like.map(e => {
        const say = Finder.findSay(e);
        if (say) {
            const name = Finder.findAuthorName(say.authorId);
            const icon = Finder.findAuthorIcon(say.authorId);
            const naLike = <i className="material-icons">favorite</i>;
            return <Line key={say.id} name={name} authorIcon={icon} say={say} likeIcon={naLike}  />
        } else {
            return null;
        }
    }).reverse();
    return <ul css={{listStyleType:'none', paddingLeft:'0px'}}>{child}</ul>
}