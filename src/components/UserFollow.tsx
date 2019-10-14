/** @jsx jsx */
import React from "react";
import { css, jsx } from '@emotion/core';
import { UserType } from "../types";
import { Finder } from '../utils'
import { Link } from "react-router-dom";

const ulStyle = css({listStyleType:'none', paddingLeft:0});
const liStyle = css({margin:'6px 0px', borderBottom:'solid 1px #ccc', padding:6});
const gridStyle = css({display:'grid', gridTemplateColumns:'180px 320px 230px'});
const flexStyle = css({display:'flex', alignItems:'center'});
const margin4px = css({margin:4});
const margin6px = css({margin:6});
const iconStyle = css({width:36, height:36, borderRadius:36, border:'solid 1px gray'});

const UserLi = ({user, sayCount}: {user: UserType, sayCount: number}) => (
    <li css={liStyle}>
        <div css={gridStyle}>
            <div css={flexStyle}>
                <Link to={{pathname:'/user', search: '?tgt=' + user.serial}} css={flexStyle}>
                    <img src={user.icon} alt="icon" css={iconStyle} />
                    <span css={margin4px}>{user.name}</span>
                </Link>
            </div>
            <div css={flexStyle}>
                <span css={margin6px}>{user.profile || ''}</span>
            </div>
            <div css={flexStyle}> 
                <span css={margin4px}>say:{sayCount}</span>
                <span css={margin4px}>follow:{user.follow.length}</span>
                <span css={margin4px}>follower:{user.follower.length}</span>
            </div>
        </div>
    </li>
);

interface FollowProps {
    tgtUsers: [string, number][]
}

export default function Follow({tgtUsers}: FollowProps) {
    const child = tgtUsers.map(e => {
        const found = Finder.findUser(e[0]);
        if (found) {
            return <UserLi key={e[0]} user={found} sayCount={e[1]} />
        } else {
            return null;
        }
    });
    return <ul css={ulStyle}>{child}</ul>
}
