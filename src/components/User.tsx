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
        const currentUser = store!.getUser;
        const tgtUser = store!.findUser(store!.showUserTarget);
        const name = tgtUser!.name;
        const say = store!.findUserSay(store!.showUserTarget);
        const says = say.map(e => {
            const dt = new Date(e.date);
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
                    <span>reply:</span>
                    <span>favorite:</span>
                </div>
            </li>
        });
        let toFollowShow = false;
        if (store!.logged && currentUser!.serial !== tgtUser!.serial && !currentUser!.follow.find(e => e === tgtUser!.serial)) {
            toFollowShow = true;
        }
        let toUnFollowShow = false;
        if (store!.logged && currentUser!.serial !== tgtUser!.serial && currentUser!.follow.find(e => e === tgtUser!.serial)) {
            toUnFollowShow = true;
        }
        return <React.Fragment>
            <div css={{margin:'12px 0px'}}>
                <h2 css={{marginBottom:'4px'}}>user</h2>
                <button className="pure-button" onClick={() => {
                    store!.setShowUserTarget(null);
                    store!.setShowMode(ShowMode.MAIN);
                }}>back to main</button>
                <div css={{display:'flex', alignItems:'center', margin:'8px 0px'}}>
                    <img src={tgtUser!.icon} css={{borderRadius:'32px', border:'solid 1px gray', margin: '4px'}} />
                    <h3>{tgtUser!.name}</h3>
                    <p css={{margin:'0px 16px'}}>
                        follow:{tgtUser!.follow.length}
                        <span> </span>
                        follower:{tgtUser!.follower.length}
                    </p>
                    <span css={{display: toFollowShow ? 'block':'none'}}>
                        <button className="pure-button" onClick={() => {
                            store!.updateUserFollow(tgtUser!.serial).then(() => {
                                alert('followed!');
                            }).catch(e => console.error(e));
                        }}>to follow</button>
                    </span>
                    <span css={{display: toUnFollowShow ? 'block':'none'}}>
                        <button className="pure-button" onClick={() => {
                            store!.updateUserUnFollow(tgtUser!.serial).then(() => {
                                alert('unfollowed!');
                            }).catch(e => console.error(e));
                        }}>to unfollow</button>
                    </span>
                </div>
                <ul css={{listStyleType:'none', padding:'0px'}}>
                    {says}
                </ul>
            </div>
        </React.Fragment>
    }
}