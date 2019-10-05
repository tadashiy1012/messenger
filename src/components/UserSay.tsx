/** @jsx jsx */
import React from "react";
import {css, jsx} from '@emotion/core';
import { MyStoreType, SayType } from "../types";
import { inject, observer } from "mobx-react";
import escape_html from "../utils/escapeHtml";

interface SayProps {
    store?: MyStoreType
    say: SayType[]
}

@inject('store')
@observer
export default class UserSay extends React.Component<SayProps> {
    render() {
        const {store} = this.props;
        const child = this.props.say.map((e) => {
            const dt = new Date(e.date);
            const name = store!.findAuthorName(e.authorId);
            return <li key={e.id} css={{borderBottom:'solid 1px #ddd', padding:'6px'}}>
                <div css={{display:'flex', alignItems:'center'}}>
                    <img src={store!.findAuthorIcon(e.authorId)} width="24" height="24" css={{
                        borderRadius:'20px', border:'solid 1px gray', margin: '4px'}}  />
                    <span css={{margin:'0px 4px'}}>{name !== 'no_name' ? name : e.author}</span>
                    <span css={{color:'#999', fontSize:'13px', margin:'0px 4px'}}>
                        {dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate() + ' ' + dt.getHours() + ':' + dt.getMinutes()}
                    </span>
                </div>
                <div css={{marginLeft:'22px', padding:'6px'}}>
                    <span dangerouslySetInnerHTML={{__html: escape_html(e.say).replace('\n', '<br/>')}}></span>
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