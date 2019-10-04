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
        const child = this.props.say.map((e) => {
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
        return <ul css={{listStyleType:'none', paddingLeft:'0px'}}>{child}</ul>
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
        return <ul css={{listStyleType:'none', paddingLeft:'0px'}}>{child}</ul>
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
        return <ul css={{listStyleType:'none', paddingLeft:'0px'}}>{child}</ul>
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

interface UserState {
    say: SayType[]
    sayLen: number
    mode: number
}

@inject('store')
@observer
export default class User extends React.Component<UserProps, UserState> {
    constructor(props: Readonly<UserProps>) {
        super(props);
        this.state = {
            say: [],
            sayLen: -1,
            mode: 0
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
                const found1 = currentUser.follow.find(e => e === tgtUser.serial);
                const found2 = tgtUser.follower.find(e => e === currentUser.serial);
                followBtn = found1 ? null : <FollowButton store={store} tgtUser={tgtUser} />;
                unfollowBtn = found2 ? <UnFollowButton store={store} tgtUser={tgtUser} /> : null;
            }
            let contents = null;
            if (this.state.mode === 0) {
                contents = <Say say={this.state.say} />
            } else if (this.state.mode === 1) {
                contents = <Follow user={tgtUser} />
            } else if (this.state.mode === 2) {
                contents = <Follower user={tgtUser} />
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
                <div css={{display:'flex', marginTop:'14px'}}>
                    <div css={{margin:'0px 4px'}}>
                        <button className="pure-button" onClick={() => {
                            this.setState({mode: 0});
                        }}>say</button>
                    </div>
                    <div css={{margin:'0px 4px'}}>
                        <button className="pure-button" onClick={() => {
                            this.setState({mode: 1});
                        }}>follow</button>
                    </div>
                    <div css={{margin:'0px 4px'}}>
                        <button className="pure-button" onClick={() => {
                            this.setState({mode: 2});
                        }}>follower</button>
                    </div>
                </div>
                <div>
                    {contents}
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
                    if (resp) {
                        store!.findUserSay(resp.serial).then((resp2) => {
                            this.setState({sayLen: resp2.length, say: resp2});
                        });
                    }
                });
                
            }
        }
        
    }
}