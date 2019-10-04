/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import {css, jsx} from '@emotion/core';
import { history } from '../stores';
import { MyStoreType, SayType, UserType } from '../types';
import UserSay from './UserSay';
import { Follow, Follower } from './UserFollow';

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
                contents = <UserSay say={this.state.say} />
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