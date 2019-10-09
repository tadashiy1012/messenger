/** @jsx jsx */
import React from "react";
import { css, jsx } from '@emotion/core';
import { UserType, SayType } from "../types";
import { observer } from "mobx-react";
import { escapeHtml, getFullDateStr, Finder } from '../utils';
import { history } from '../stores';
import { Link } from "react-router-dom";

interface ReplyProps {
    tgtUser: UserType
}

@observer
export default class UserReply extends React.Component<ReplyProps> {
    render() {
        const {tgtUser} = this.props;
        const userSays = Finder.findUserSaySync(tgtUser.serial);
        const data = Finder.searchReply(tgtUser.serial).map<[SayType, SayType[]]>(e => {
            const reply = userSays.filter(ee => e.reply.find(eee => eee === ee.id) !== undefined);
            return [e, reply];
        }).sort((a, b) => {
            return b[1][b[1].length - 1].date - a[1][a[1].length - 1].date;
        });
        const child = data.map(e => {
            const msg = e[0];
            const rep = e[1];
            const reply = rep.map(ee => {
                const rname = Finder.findAuthorName(ee.authorId);
                return <li key={ee.id}>
                    <div css={{display:'flex', alignItems:'center'}}>
                        <img src={Finder.findAuthorIcon(ee.authorId)} width="24" height="24" css={{
                            borderRadius:'20px', border:'solid 1px gray', margin: '4px'}}  />
                        <span css={{margin:'0px 4px'}}>{rname !== 'no_name' ? rname : ee.author}</span>
                        <span css={{color:'#999', fontSize:'13px', margin:'0px 4px'}}>
                            {getFullDateStr(ee.date)}
                        </span>
                        <div css={{display:'flex', alignItems:'center', color:'#999', fontSize:'13px', margin:'0px 4px'}}>
                            <i className="material-icons" css={{fontSize:'20px'}}>message</i>
                            <span>reply:{ee.reply.length}</span>
                        </div>
                        <div css={{display:'flex', alignItems:'center', color:'#999', fontSize:'13px', margin:'0px 4px'}}>
                            <i className="material-icons" css={{fontSize:'20px'}}>favorite</i>
                            <span>like:{ee.like.length}</span>
                        </div>
                    </div>
                    <div css={{marginLeft:'22px', padding:'6px'}}>
                        <span dangerouslySetInnerHTML={{__html: escapeHtml(ee.say).replace('\n', '<br/>')}}></span>
                    </div>
                </li>
            });
            const name = Finder.findAuthorName(msg.authorId);
            const namedIcon = msg.authorId !== tgtUser.serial ? <React.Fragment>
                    <Link to={{pathname:'/user', search: '?tgt=' + msg.authorId}} 
                            css={{display:'flex', alignItems:'center'}} onClick={(ev) => { ev.stopPropagation(); }}>
                        <img src={Finder.findAuthorIcon(msg.authorId)} width="24" height="24" 
                            css={{borderRadius:'20px', border:'solid 1px gray', margin: '4px'}} />
                        <span css={{margin:'0px 4px'}}>{name !== 'no_name' ? name : msg.author}</span>
                    </Link>
                </React.Fragment> : <React.Fragment>
                    <img src={Finder.findAuthorIcon(msg.authorId)} width="24" height="24" 
                        css={{borderRadius:'20px', border:'solid 1px gray', margin: '4px'}} />
                    <span css={{margin:'0px 4px'}}>{name !== 'no_name' ? name : msg.author}</span>
                </React.Fragment>
            return <li key={msg.id} css={{borderBottom:'solid 1px #ddd', padding:'6px'}}>
                <div css={{cursor:'pointer', '&:hover':{backgroundColor: '#eee'}}} onClick={() => {
                    history.push({pathname:'/message', search:'?tgt=' + msg.id});
                }}>
                    <div css={{display:'flex'}}>
                        <div css={{display:'flex', alignItems:'center'}}>
                            {namedIcon}
                            <span css={{color:'#999', fontSize:'13px', margin:'0px 4px'}}>
                                {getFullDateStr(msg.date)}
                            </span>
                        </div>
                        <div css={{display:'flex', alignItems:'center', marginLeft:'14px'}}>
                            <div css={{display:'flex', alignItems:'center', color:'#999', fontSize:'13px', margin:'0px 6px'}}>
                                <i className="material-icons">message</i>
                                <span>reply:{msg.reply.length}</span>
                            </div>
                            <div css={{display:'flex', alignItems:'center', color:'#999', fontSize:'13px', margin:'0px 6px'}}>
                                <i className="material-icons">favorite</i>
                                <span>like:{msg.like.length}</span>
                            </div>
                        </div>
                    </div>
                    <div css={{marginLeft:'22px', padding:'6px'}}>
                        <span dangerouslySetInnerHTML={{__html: escapeHtml(msg.say).replace('\n', '<br/>')}}></span>
                    </div>
                    <ul css={{listStyleType:'none', paddingLeft:'18px'}}>
                        {reply}
                    </ul>
                </div>
            </li>
        });
        return <ul css={{listStyleType:'none', paddingLeft:'0px'}}>{child}</ul>
    }
}