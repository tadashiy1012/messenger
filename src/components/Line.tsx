/** @jsx jsx */
import * as React from 'react';
import { css, jsx } from '@emotion/core';
import { SayType } from '../types';
import { Link } from 'react-router-dom';
import { history } from '../stores';
import { escapeHtml, getFullDateStr } from '../utils';

const liStyle = css({
    borderBottom:'solid 1px #ddd', padding:'6px', cursor:'pointer', '&:hover':{backgroundColor: '#eee'}
});
const linkStyle = css({display:'flex', alignItems:'center'});
const iconStyle = css({borderRadius:'20px', border:'solid 1px gray', margin: '4px'});
const dateStyle = css({color:'#999', fontSize:'13px', margin:'0px 4px'});
const bodyStyle = css({marginLeft:'22px', padding:'6px'});
const footerStyle = css({display:'flex', justifyContent:'space-around', fontSize:'11px', color:'#999'});
const footerItemStyle = css({display:'flex', alignItems:'center', cursor:'initial'});

type LineType = {name: string, say: SayType, authorIcon: string, likeIcon: JSX.Element};

export default function Line({name, say, authorIcon, likeIcon}: LineType) {
    return (<li css={liStyle} onClick={(ev) => {
        ev.preventDefault();
        history.push({pathname:'/message', search:'?tgt=' + say.id});
    }}>
        <div css={linkStyle}>
            <Link to={{pathname:'/user', search: '?tgt=' + say.authorId}} css={linkStyle} onClick={(ev) => {
                ev.stopPropagation();
            }}>
                <img src={authorIcon} width="24" height="24" css={iconStyle}  />
                <span css={{margin:'0px 4px'}}>{name !== 'no_name' ? name : say.author}</span>
            </Link>
            <span css={dateStyle}>{getFullDateStr(say.date)}</span>
        </div>
        <div css={bodyStyle}>
            <span dangerouslySetInnerHTML={{__html: escapeHtml(say.say).replace('\n', '<br/>')}}></span>
        </div>
        <div css={footerStyle}>
            <div css={footerItemStyle} onClick={(ev) => {
                ev.stopPropagation();
            }}>
                <i className="material-icons">message</i>
                <span>reply:{say.reply.length}</span>
            </div>
            <div css={footerItemStyle} onClick={(ev) => {
                ev.stopPropagation();
            }}>
                {likeIcon}
                <span>like:{say.like.length}</span>
            </div>
        </div>
    </li>);
}