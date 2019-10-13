/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { css, jsx } from '@emotion/core';
import { history } from '../stores';
import { UserStoreType, SayType, UserType, SettingStoreType } from '../types';
import { Finder, compareJson } from '../utils';
import UserSay from './UserSay';
import { Follow, Follower } from './UserFollow';
import UserLike from './UserLike';
import UserReply from './UserReply';

const FollowButton = (props: {user?: UserStoreType, tgtUser: UserType}) => (
    <button className="pure-button" onClick={() => {
        props.user!.updateUserFollow(props.tgtUser.serial).catch(err => console.error(err));
    }}>to follow</button>
);

const UnFollowButton = (props: {user?: UserStoreType, tgtUser: UserType}) => (
    <button className="pure-button" onClick={() => {
        props.user!.updateUserUnFollow(props.tgtUser.serial).catch(err => console.error(err));
    }}>to unfollow</button>
);

interface UserProps {
    user?: UserStoreType
    setting?: SettingStoreType
}

interface UserState {
    say: SayType[]
    sayLen: number
    mode: number
}

@inject('user', 'setting')
@observer
export default class User extends React.Component<UserProps, UserState> {
    private prevQuery: string[];
    private unlisten: any;
    constructor(props: Readonly<UserProps>) {
        super(props);
        this.state = {
            say: [],
            sayLen: -1,
            mode: 0
        };
        this.prevQuery = [];
        this.unlisten = history.listen((location) => {
            const {setting} = this.props;
            if (location.pathname === '/user' && location.search) {
                const query = location.search.substring(1).split('&');
                if (!compareJson(query, this.prevQuery)) {
                    this.prevQuery = [...query];
                    const tgtSerial = query[0].split('=')[1];
                    setting!.setShowUserTarget(tgtSerial);
                    Finder.findUserAsync(tgtSerial).then((resp) => {
                        if (resp) {
                            Finder.findUserSay(resp.serial).then((resp2) => {
                                this.setState({sayLen: resp2.length, say: resp2});
                            });
                        }
                    });
                }
            }
        });
    }
    render() {
        const {user, setting} = this.props;
        const tgt = setting!.showUserTarget;
        const tgtUser = Finder.findUser(tgt!);
        if (tgtUser) {
            const currentUser = user!.getUser;
            let followBtn = null;
            let unfollowBtn = null;
            if (user!.logged && currentUser && currentUser.serial !== tgtUser.serial) {
                const found1 = currentUser.follow.find(e => e === tgtUser.serial);
                const found2 = tgtUser.follower.find(e => e === currentUser.serial);
                followBtn = found1 ? null : <FollowButton user={user} tgtUser={tgtUser} />;
                unfollowBtn = found2 ? <UnFollowButton user={user} tgtUser={tgtUser} /> : null;
            }
            let contents = null;
            if (this.state.mode === 0) {
                contents = <UserSay say={this.state.say} />
            } else if (this.state.mode === 1) {
                contents = <Follow tgtUser={tgtUser} />
            } else if (this.state.mode === 2) {
                contents = <Follower tgtUser={tgtUser} />
            } else if (this.state.mode === 3) {
                contents = <UserLike like={tgtUser.like} />
            } else if (this.state.mode === 4) {
                contents = <UserReply tgtUser={tgtUser} user={user} />
            }
            return <React.Fragment>
                <div css={{display:'flex', alignItems:'center'}}>
                    <img src={tgtUser.icon} alt="icon" width="50" height="50" css={{borderRadius:'50px', border:'solid 1px gray'}}/>
                    <span css={{margin:'4px'}}>{tgtUser.name}</span>
                    <span css={{margin:'4px'}}> </span>
                    <span css={{margin:'4px'}}>say:{this.state.sayLen}</span>
                    <span css={{margin:'4px'}}>follow:{tgtUser.follow.length}</span>
                    <span css={{margin:'4px'}}>follower:{tgtUser.follower.length}</span>
                    {followBtn}
                    {unfollowBtn}
                </div>
                <div>
                    <p css={{padding:'8px'}}>{tgtUser.profile || ''}</p>
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
                    <div css={{margin:'0px 4px'}}>
                        <button className="pure-button" onClick={() => {
                            this.setState({mode: 3});
                        }}>like</button>
                    </div>
                    <div css={{margin:'0px 4px'}}>
                        <button className="pure-button" onClick={() => {
                            this.setState({mode: 4});
                        }}>reply</button>
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
        const {user, setting} = this.props;
        if (history) {
            const params = history.location.search.substring(1).split('&');
            if (params.length > 0) {
                const tgtSerial = params[0].split('=')[1];
                setting!.setShowUserTarget(tgtSerial);
                Finder.findUserAsync(tgtSerial).then((resp) => {
                    if (resp) {
                        Finder.findUserSay(resp.serial).then((resp2) => {
                            this.setState({sayLen: resp2.length, say: resp2});
                        });
                    }
                });
            }
        }
    }
    componentWillUnmount() {
        this.unlisten();
    }
}