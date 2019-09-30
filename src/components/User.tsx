/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import {css, jsx} from '@emotion/core';
import { MyStoreType } from '../types';
import { ShowMode } from '../enums';

function escape_html (string: string): string {
    if(typeof string !== 'string') {
        return string;
    }
    return string.replace(/[&'`"<>]/g, (match) => {
        switch (match) {
            case '&':
                return '&amp;';
            case "'": 
                return '&#x27;';
            case '`':
                return '&#x60;';
            case '"':
                return '&quot;';
            case '<': 
                return '&lt;';
            case '>': 
                return '&gt;';
            default:
                return match
        }
    });
}

interface UserProps {
    store?: MyStoreType
}

@inject('store')
@observer
export default class User extends React.Component<UserProps> {
    render() {
        const {store} = this.props;
        const user = store!.findUser(store!.showUserTarget);
        const name = user!.name;
        const say = store!.findUserSay(store!.showUserTarget);
        const says = say.map(e => {
            const dt = new Date(e.date);
            return <li key={e.id} css={{borderBottom:'solid 1px #ddd', padding:'6px'}}>
                <div css={{display:'flex', alignItems:'center'}}>
                    <a href="#" onClick={(ev) => {
                        ev.preventDefault();
                        store!.setShowUserTarget(e.authorId);
                        store!.setShowMode(ShowMode.USER);
                    }}>
                        <img src={store!.findAuthorIcon(e.authorId)} width="24" height="24" css={{
                            borderRadius:'20px', border:'solid 1px gray', margin: '4px'}}  />
                    </a>
                    <span css={{margin:'0px 4px'}}>{name !== 'no_name' ? name : e.author}</span>
                    <span css={{color:'#999', fontSize:'13px', margin:'0px 4px'}}>
                        {dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate() + ' ' + dt.getHours() + ':' + dt.getMinutes()}
                    </span>
                </div>
                <div css={{marginLeft:'22px', padding:'6px'}}>
                    <span dangerouslySetInnerHTML={{__html: escape_html(e.say).replace('\n', '<br/>')}}></span>
                </div>
                <div css={{display:'flex', justifyContent:'space-around', fontSize:'11px', color:'#999'}}>
                    <span>reply:</span>
                    <span>favorite:</span>
                </div>
            </li>
        });
        return <React.Fragment>
            <div css={{margin:'12px 0px'}}>
                <h2 css={{marginBottom:'4px'}}>user</h2>
                <button className="pure-button" onClick={() => {
                    store!.setShowUserTarget(null);
                    store!.setShowMode(ShowMode.MAIN);
                }}>back to main</button>
                <div css={{display:'flex', alignItems:'center', margin:'8px 0px'}}>
                    <img src={user!.icon} css={{borderRadius:'32px', border:'solid 1px gray', margin: '4px'}} />
                    <h3>{user!.name}</h3>
                    <p css={{margin:'0px 16px'}}>
                        follow:{user!.follow.length}
                        <span> </span>
                        follower:{user!.follower.length}
                    </p>
                    <span css={{display:store!.logged ? 'block':'none'}}>
                        <button className="pure-button" onClick={() => {
                        }}>to follow</button>
                    </span>
                </div>
                <ul css={{listStyleType:'none', padding:'0px'}}>
                    {says}
                </ul>
            </div>
        </React.Fragment>
    }
}