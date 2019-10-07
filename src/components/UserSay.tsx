/** @jsx jsx */
import React from "react";
import {css, jsx} from '@emotion/core';
import { UserStoreType, SayType } from "../types";
import { inject, observer } from "mobx-react";
import { escapeHtml, getFullDateStr } from '../utils';

interface SayProps {
    user?: UserStoreType
    say: SayType[]
}

@inject('user')
@observer
export default class UserSay extends React.Component<SayProps> {
    render() {
        const {user} = this.props;
        const child = this.props.say.map((e) => {
            const name = user!.findAuthorName(e.authorId);
            return <li key={e.id} css={{borderBottom:'solid 1px #ddd', padding:'6px'}}>
                <div css={{display:'flex', alignItems:'center'}}>
                    <img src={user!.findAuthorIcon(e.authorId)} width="24" height="24" css={{
                        borderRadius:'20px', border:'solid 1px gray', margin: '4px'}}  />
                    <span css={{margin:'0px 4px'}}>{name !== 'no_name' ? name : e.author}</span>
                    <span css={{color:'#999', fontSize:'13px', margin:'0px 4px'}}>
                        {getFullDateStr(e.date)}
                    </span>
                </div>
                <div css={{marginLeft:'22px', padding:'6px'}}>
                    <span dangerouslySetInnerHTML={{__html: escapeHtml(e.say).replace('\n', '<br/>')}}></span>
                </div>
                <div css={{display:'flex', justifyContent:'space-around', fontSize:'11px', color:'#999'}}>
                    <div css={{display:'flex', alignItems:'center'}}>
                        <i className="material-icons">message</i>
                        <span>reply:{e.reply.length}</span>
                    </div>
                    <div css={{display:'flex', alignItems:'center'}}>
                        <i className="material-icons">favorite</i>;
                        <span>like:{e.like.length}</span>
                    </div>
                </div>
            </li>
        });
        return <ul css={{listStyleType:'none', paddingLeft:'0px'}}>{child}</ul>
    }
}