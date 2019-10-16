/** @jsx jsx */
import * as React from 'react';
import { css, jsx } from '@emotion/core';
import { SayType } from '../../types';
import { Link } from 'react-router-dom';
import { history } from '../../stores';
import { escapeHtml, getFullDateStr } from '../../utils';

const liStyle = css({
    borderBottom:'solid 1px #ddd', padding:'6px', cursor:'pointer', '&:hover':{backgroundColor: '#eee'}
});
const linkStyle = css({display:'flex', alignItems:'center'});
const iconStyle = css({borderRadius:'20px', border:'solid 1px gray', margin: '4px'});
const marginX4px = css({margin:'0px 4px'});
const dateStyle = css({color:'#999', fontSize:'13px', margin:'0px 4px'});
const bodyStyle = css({marginLeft:'22px', padding:'6px'});
const footerStyle = css({display:'flex', justifyContent:'space-around', fontSize:'11px', color:'#999'});
const footerItemStyle = css({display:'flex', alignItems:'center', cursor:'initial'});

type LineType = {name: string, say: SayType, authorIcon: string, likeIcon: JSX.Element};

export default function Line({name, say, authorIcon, likeIcon}: LineType) {
    const liClick = (ev: React.MouseEvent) => {
        ev.preventDefault();
        history.push({pathname:'/message', search:'?tgt=' + say.id});
    };
    const linkClick = (ev: React.MouseEvent) => {
        ev.stopPropagation();
    };
    const likeClick = (ev: React.MouseEvent) => {
        ev.stopPropagation();
    };
    const msgls = escapeHtml(say.say).split('\n');
    const msgBody = msgls.reduce((acc: JSX.Element[], crnt: string, i: number) => {
        const tests = crnt.split(' ').map(e => e.match(/^#.*/)).filter(e => e !== null);
        if (tests.length > 0) {
            acc.push(<React.Fragment key={i}>{tests.map((e, ii) => <span key={ii}>{e![0]} </span>)}<br /></React.Fragment>);
        } else {
            acc.push(<React.Fragment key={i}><span>{crnt}</span><br/></React.Fragment>);
        }
        return acc;
    }, []);

    return (<li css={liStyle} onClick={liClick}>
        <div css={linkStyle}>
            <Link to={{pathname:'/user', search: '?tgt=' + say.authorId}} css={linkStyle} onClick={linkClick}>
                <img src={authorIcon} width="24" height="24" css={iconStyle}  />
                <span css={marginX4px}>{name}</span>
            </Link>
            <span css={dateStyle}>{getFullDateStr(say.date)}</span>
        </div>
        <div css={bodyStyle}>
            <span>{msgBody}</span>
        </div>
        <div css={footerStyle}>
            <div css={footerItemStyle}>
                <i className="material-icons">message</i>
                <span>reply:{say.reply.length}</span>
            </div>
            <div css={footerItemStyle} onClick={likeClick}>
                {likeIcon}
                <span>like:{say.like.length}</span>
            </div>
        </div>
    </li>);
}