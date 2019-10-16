/** @jsx jsx */
import * as React from 'react';
import { css, jsx } from '@emotion/core';
import { SayType } from '../../types';
import { Link } from 'react-router-dom';
import { history } from '../../stores';
import { escapeHtml, getFullDateStr, Finder } from '../../utils';

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

const HTagLink = ({tag, children}: {tag:string, children:React.ReactNode}) => {
    const linkClick = (ev: React.MouseEvent) => {
        ev.stopPropagation();
    };
    return (
        <Link to={{pathname:'/search', search:'?word=' + tag}} 
            onClick={linkClick}>
            {children}
        </Link>
    );
}

const MentionLink = ({tgt, children}: {tgt:string, children:React.ReactNode}) => {
    const tgtUser = Finder.findUserByName(tgt.substring(1));
    const linkClick = (ev: React.MouseEvent) => {
        ev.stopPropagation();
    };
    return (
        <Link to={{pathname:'/user', search:'?tgt=' + (tgtUser ? tgtUser.serial : '')}}
            onClick={linkClick}>
            {children}
        </Link>
    );
};

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
        const testsA = crnt.split(' ').map(e => e.match(/^#.*/)).filter(e => e !== null);
        const testsB = crnt.split(' ').map(e => e.match(/^@.*/) || e);
        console.log(testsB);
        if (testsA.length > 0) {
            acc.push(<React.Fragment key={i}>
                {testsA.map((e, ii) => <React.Fragment key={ii}>
                    <HTagLink tag={e![0]}>{e![0]}</HTagLink>
                    <span> </span>
                </React.Fragment>)}
                <br />
            </React.Fragment>);
        } else if (testsB.length > 0) {
            acc.push(<React.Fragment key={i}>
                {testsB.map((e, ii) => <React.Fragment key={ii}>
                    {typeof e === 'string'
                        ? <span>{e}</span>
                        : <MentionLink tgt={e[0]}>{e[0]}</MentionLink>
                    }
                    <span> </span>
                </React.Fragment>)}
                <br />
            </React.Fragment>);
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