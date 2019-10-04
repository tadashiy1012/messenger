/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import {css, jsx} from '@emotion/core';
import { history } from '../stores';
import { MyStoreType, SayType, UserType } from '../types';
import escape_html from '../utils/escapeHtml';

interface SayProps {
    store?: MyStoreType
    say: SayType[]
}

@inject('store')
@observer
class Say extends React.Component<SayProps> {
    render() {
        const {store} = this.props;
        return this.props.say.map((e) => {
            const dt = new Date(e.date);
            const name = store!.findAuthorname(e.authorId);
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
    }
}

interface FollowProps {
    store?: MyStoreType
    user: UserType
}

@inject('store')
@observer
class Follow extends React.Component<FollowProps> {
    render() {
        const {store, user} = this.props;
        const child = user.follow.map(e => {
            const follow = store!.findUser(e);
            return <li key={e}>
                <div css={{display:'flex', alignItems:'center'}}>
                    <img src={follow!.icon} alt="icon" width="36" height="36" css={{borderRadius:'36px', border:'solid 1px gray'}} />
                    <span css={{margin:'4px'}}>{follow!.name}</span>
                    <span css={{margin:'4px'}}>say:{0}</span>
                    <span css={{margin:'4px'}}>follow:{follow!.follow.length}</span>
                    <span css={{margin:'4px'}}>follower:{follow!.follower.length}</span>
                </div>
            </li>
        });
        return <React.Fragment>{child}</React.Fragment>
    }
}

interface FollowerProps {
    store?: MyStoreType
    user: UserType
}

@inject('store')
@observer
class Follower extends React.Component<FollowerProps> {
    render() {
        const {store, user} = this.props;
        const child = user.follower.map(e => {
            const follower = store!.findUser(e);
            return <li key={e}>
                <div css={{display:'flex', alignItems:'center'}}>
                    <img src={follower!.icon} alt="icon" width="36" height="36" css={{borderRadius:'36px', border:'solid 1px gray'}} />
                    <span css={{margin:'4px'}}>{follower!.name}</span>
                    <span css={{margin:'4px'}}>say:{0}</span>
                    <span css={{margin:'4px'}}>follow:{follower!.follow.length}</span>
                    <span css={{margin:'4px'}}>follower:{follower!.follower.length}</span>
                </div>
            </li>
        });
        return <React.Fragment>{child}</React.Fragment>
    }
}

const FollowButton = (props: {store?: MyStoreType, tgtUser: UserType}) => (
    <button className="pure-button" onClick={() => {
        props.store!.updateUserFollow(props.tgtUser.serial).catch(err => console.error(err));
    }}>to follow</button>
);

const UnFollowButton = (props: {store?: MyStoreType, tgtUser: UserType}) => (
    <button className="pure-button" onClick={() => {
        props.store!.updateUserUnFollow(props.tgtUser.serial).catch(err => console.error(err));
    }}>to unfollow</button>
);

interface UserProps {
    store?: MyStoreType
}

@inject('store')
@observer
export default class User extends React.Component<UserProps, {say: SayType[], sayLen: number}> {
    constructor(props: Readonly<UserProps>) {
        super(props);
        this.state = {
            say: [],
            sayLen: -1
        };
    }
    render() {
        const {store} = this.props;
        const tgtUser = store!.findUser(store!.showUserTarget);
        if (tgtUser) {
            const currentUser = store!.getUser;
            let followBtn = null;
            let unfollowBtn = null;
            if (store!.logged && currentUser && currentUser.serial !== tgtUser.serial) {
                const found = tgtUser.follow.find(e => e === currentUser.serial);
                console.log(found);
                followBtn = found ? null : <FollowButton store={store} tgtUser={tgtUser} />;
                unfollowBtn = found ? <UnFollowButton store={store} tgtUser={tgtUser} /> : null;
            }
            return <React.Fragment>
                <div css={{display:'flex', alignItems:'center'}}>
                    <img src={tgtUser.icon} alt="icon" width="42" height="42" css={{borderRadius:'42px', border:'solid 1px gray'}}/>
                    <span css={{margin:'4px'}}>{tgtUser.name}</span>
                    <span css={{margin:'4px'}}> </span>
                    <span css={{margin:'4px'}}>say:{this.state.sayLen}</span>
                    <span css={{margin:'4px'}}>follow:{tgtUser.follow.length}</span>
                    <span css={{margin:'4px'}}>follower:{tgtUser.follower.length}</span>
                    {followBtn}
                    {unfollowBtn}
                </div>
                <div css={{display:'flex', justifyContent:'space-between'}}>
                    <div css={{width:'33%'}}>
                        <h4>say</h4>
                        <ul css={{listStyleType:'none', padding:'0px'}}>
                            <Say say={this.state.say} />
                        </ul>
                    </div>
                    <div css={{width:'33%'}}>
                        <h4>follow</h4>
                        <ul css={{listStyleType:'none', padding:'0px'}}>
                            <Follow user={tgtUser} />
                        </ul>
                    </div>
                    <div css={{width:'33%'}}>
                        <h4>follower</h4>
                        <ul css={{listStyleType:'none', padding:'0px'}}>
                            <Follower user={tgtUser} />
                        </ul>
                    </div>
                </div>
            </React.Fragment>
        } else {
            return <p>user not found</p>
        }
    }
    componentDidMount() {
        const {store} = this.props;
        if (history) {
            const params = history.location.search.substring(1).split('&');
            if (params.length > 0) {
                const tgtSerial = params[0].split('=')[1];
                console.log(tgtSerial);
                store!.setShowUserTarget(tgtSerial);
                store!.findUserAsync(tgtSerial).then((resp) => {
                    console.log(resp);
                    if (resp) {
                        store!.findUserSay(resp.serial).then((resp2) => {
                            console.log(resp2);
                            this.setState({sayLen: resp2.length, say: resp2});
                        });
                    }
                });
                
            }
        }
        
    }
}