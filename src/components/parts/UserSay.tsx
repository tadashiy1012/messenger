/** @jsx jsx */
import React from "react";
import { jsx } from '@emotion/core';
import { SayType } from "../../types";
import { Finder } from '../../utils';
import { Line } from '../parts';

interface SayProps {
    say: SayType[]
}

export default function UserSay({say}: SayProps) {
    const child = say.map((e) => {
        const name = Finder.findAuthorName(e.authorId);
        const icon = Finder.findAuthorIcon(e.authorId);
        const naLike = <i className="material-icons">favorite</i>;
        return <Line key={e.id} name={name} authorIcon={icon} say={e} likeIcon={naLike} />;
    }).reverse();
    return <ul css={{listStyleType:'none', paddingLeft:'0px'}}>{child}</ul>;
}