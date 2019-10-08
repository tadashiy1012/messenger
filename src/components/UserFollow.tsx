/** @jsx jsx */
import React from "react";
import { css, jsx } from '@emotion/core';
import { inject, observer } from "mobx-react";
import { UserStoreType, UserType } from "../types";
import { Finder } from '../utils'

interface FollowProps {
    user?: UserStoreType
    tgtUser: UserType
}

@inject('user')
@observer
class Follow extends React.Component<FollowProps> {
    render() {
        const {user, tgtUser} = this.props;
        const child = tgtUser.follow.map(e => {
            const follow = Finder.findUser(e);
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
    user?: UserStoreType
    tgtUser: UserType
}

@inject('user')
@observer
class Follower extends React.Component<FollowerProps> {
    render() {
        const {user, tgtUser} = this.props;
        const child = tgtUser.follower.map(e => {
            const follower = Finder.findUser(e);
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

export {
    Follow,
    Follower,
};