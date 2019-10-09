/** @jsx jsx */
import React from "react";
import { css, jsx } from '@emotion/core';
import { observer } from "mobx-react";
import { escapeHtml, getFullDateStr, Finder } from '../utils';
import { history } from '../stores';
import { Link } from "react-router-dom";

interface LikeProps {
    like: string[]
}

@observer
export default class UserLike extends React.Component<LikeProps> {
    render() {
        const {like} = this.props;
        const child = like.map(e => {
            const say = Finder.findSay(e);
            if (say) {
                const name = Finder.findAuthorName(say.authorId);
                return <li key={say.id} css={{borderBottom:'solid 1px #ddd', padding:'6px'}}>
                    <div css={{cursor:'pointer', '&:hover':{backgroundColor: '#eee'}}} onClick={() => {
                        history.push({pathname:'/message', search:'?tgt=' + say.id});
                    }}>
                        <div css={{display:'flex', alignItems:'center'}}>
                            <Link to={{pathname:'/user', search: '?tgt=' + say.authorId}} css={{
                                display:'flex', alignItems:'center'
                            }} onClick={(ev) => {
                                ev.stopPropagation();
                            }}>
                                <img src={Finder.findAuthorIcon(say.authorId)} width="24" height="24" css={{
                                    borderRadius:'20px', border:'solid 1px gray', margin: '4px'}}  />
                                <span css={{margin:'0px 4px'}}>{name !== 'no_name' ? name : say.author}</span>
                            </Link>
                            <span css={{color:'#999', fontSize:'13px', margin:'0px 4px'}}>
                                {getFullDateStr(say.date)}
                            </span>
                        </div>
                        <div css={{marginLeft:'22px', padding:'6px'}}>
                            <span dangerouslySetInnerHTML={{__html: escapeHtml(say.say).replace('\n', '<br/>')}}></span>
                        </div>
                        <div css={{display:'flex', justifyContent:'space-around', fontSize:'11px', color:'#999'}}>
                            <div css={{display:'flex', alignItems:'center'}}>
                                <i className="material-icons">message</i>
                                <span>reply:{say.reply.length}</span>
                            </div>
                            <div css={{display:'flex', alignItems:'center'}}>
                                <i className="material-icons">favorite</i>
                                <span>like:{say.like.length}</span>
                            </div>
                        </div>
                    </div>
                </li>
            } else {
                return null;
            }
        }).reverse();
        return <ul css={{listStyleType:'none', paddingLeft:'0px'}}>{child}</ul>
    }
}