/** @jsx jsx */
import * as React from 'react';
import { css, jsx } from '@emotion/core';
import { history } from '../../stores';
import { Link } from 'react-router-dom';
import { UserType } from '../../types';

const liStyle = css({borderBottom:'solid 1px #ccc', padding:'16px', cursor:'pointer', '&:hover':{backgroundColor: '#eee'}});
const bodyStyle = css({display:'grid', gridTemplateColumns:'180px 320px 230px'});
const imgStyle = css({borderRadius:'36px', border:'solid 1px gray'});
const flexCenter = css({display:'flex', alignItems:'center'});
const margin4px = css({margin:'4px'});

export default function LineUsr({usr, count}: {usr: UserType, count: number}) {
    const bodyClick = () => {
        history.push({pathname:'/user', search:'?tgt=' + usr.serial});
    };
    const linkClick = (ev: React.MouseEvent) => {
        ev.stopPropagation();
    };
    return (
        <li css={liStyle}>
            <div css={bodyStyle} onClick={bodyClick}>
                <div css={flexCenter}>
                    <Link to={{pathname:'/user', search: '?tgt=' + usr.serial}} css={flexCenter} onClick={linkClick}>
                        <img src={usr.icon} alt="icon" width="36" height="36" css={imgStyle} />
                        <span css={margin4px}>{usr.name}</span>
                    </Link>
                </div>
                <div css={flexCenter}><span css={{margin:'6px'}}>{usr.profile || ''}</span></div>
                <div css={flexCenter}> 
                    <span css={margin4px}>say:{count}</span>
                    <span css={margin4px}>follow:{usr.follow.length}</span>
                    <span css={margin4px}>follower:{usr.follower.length}</span>
                </div>
            </div>
        </li>
    );
}