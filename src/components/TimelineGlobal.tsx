/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { css, jsx } from '@emotion/core';
import { UserStoreType, SayType, SayStoreType } from '../types';
import { Link } from 'react-router-dom';
import { history } from '../stores';
import { escapeHtml, getFullDateStr, Finder } from '../utils';

const liStyle = {
    borderBottom:'solid 1px #ddd', padding:'6px', cursor:'pointer', '&:hover':{backgroundColor: '#eee'}
};
const linkStyle = {display:'flex', alignItems:'center'};
const iconStyle = {borderRadius:'20px', border:'solid 1px gray', margin: '4px'};
const dateStyle = {color:'#999', fontSize:'13px', margin:'0px 4px'};
const bodyStyle = {marginLeft:'22px', padding:'6px'};
const footerStyle = {display:'flex', justifyContent:'space-around', fontSize:'11px', color:'#999'};
const footerItemStyle = {display:'flex', alignItems:'center', cursor:'initial'};


type LineType = {name: string, say: SayType, authorIcon: string, likeIcon: JSX.Element};

const Line = ({name, say, authorIcon, likeIcon}: LineType) => (
    <li css={liStyle} onClick={(ev) => {
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
    </li>
);

interface GlobalProps {
    user?: UserStoreType
    say?: SayStoreType
    likeClickHandler(say: SayType): void
    unLikeClickHandler(say: SayType): void
}

interface GlobalState {
    index: number
}

@inject('user', 'say')
@observer
export default class GlobalTL extends React.Component<GlobalProps, GlobalState> {
    constructor(props: Readonly<GlobalProps>) {
        super(props);
        this.state = {
            index: 10
        };
    }
    makeChild(src: SayType[]) {
        const {user} = this.props;
        const crntUser = user!.getUser;
        return src.map(e => {
            const name = Finder.findAuthorName(e.authorId);
            const icon = Finder.findAuthorIcon(e.authorId);
            const alike = crntUser && e.like.find(ee => ee === crntUser!.serial) ? 
                <i className="material-icons" css={{cursor:'pointer'}} onClick={() => {
                    this.props.unLikeClickHandler(e)}}>favorite</i> :
                <i className="material-icons" css={{cursor:'pointer'}} onClick={() => {
                    this.props.likeClickHandler(e)}}>favorite_border</i>;
            const naLike = crntUser && e.like.find(ee => ee === crntUser!.serial) ? 
                <i className="material-icons">favorite</i> :
                <i className="material-icons">favorite_border</i>
            const like = user!.logged && crntUser && crntUser.serial !== e.authorId ? alike : naLike;
            return <Line key={e.id} name={name} authorIcon={icon} say={e} likeIcon={like} />
        });
    }
    render() {
        const {user, say} = this.props;
        const tl = [...say!.timeLine].reverse().slice(0, this.state.index);
        return <div css={{width:user!.logged ? '48%':'100%'}}>
            <h4 css={{margin:'2px 0px'}}>global timeline</h4>
            <ul css={{listStyleType:'none', padding:'0px'}}>{this.makeChild(tl)}</ul>
            <div css={{display:'flex', justifyContent:'center'}}>
                <button className="pure-button" onClick={() => {
                    this.setState({index: this.state.index + 10});
                }}>view more</button>
            </div>
        </div>
    }
}