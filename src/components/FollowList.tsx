/** @jsx jsx */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observer, inject } from 'mobx-react';
import { css, jsx } from '@emotion/core';
import { MyStoreType } from '../types';

interface FollowProps {
    store?: MyStoreType
}

@inject('store')
@observer
class Follow extends React.Component<FollowProps> {
    render() {
        const {store} = this.props;
        const user = store!.getUser;
        const child = user!.follow.map(e => {
            const follow = store!.findUser(e);
            return <li key={e}>
                <div css={{display:'flex', alignItems:'center'}}>
                    <img src={follow!.icon} alt="icon" width="36" height="36" css={{borderRadius:'36px', border:'solid 1px gray'}} />
                    <span css={{margin:'4px'}}>{follow!.name}</span>
                    <span css={{margin:'4px'}}>say:{store!.findUserSay(follow!.serial).length}</span>
                    <span css={{margin:'4px'}}>follow:{follow!.follow.length}</span>
                    <span css={{margin:'4px'}}>follower:{follow!.follower.length}</span>
                    <span css={{margin:'4px'}}>
                        <button className="pure-button" onClick={() => {
                            store!.updateUserUnFollow(follow!.serial).catch(err => console.error(err));
                        }}>unfollow</button>
                    </span>
                </div>
            </li>
        });
        return <div>
            <h3>follow list</h3>
            <ul css={{listStyleType:'none', paddingLeft:'0px'}}>
                {child}
            </ul>
        </div>
    }
}

interface FollowerProps {
    store?: MyStoreType
}

@inject('store')
@observer
class Follower extends React.Component<FollowerProps> {
    render() {
        const {store} = this.props;
        const user = store!.getUser;
        const child = user!.follower.map(e => {
            const follower = store!.findUser(e);
            return <li key={e}>
                <div css={{display:'flex', alignItems:'center'}}>
                    <img src={follower!.icon} alt="icon" width="36" height="36" css={{borderRadius:'36px', border:'solid 1px gray'}} />
                    <span css={{margin:'4px'}}>{follower!.name}</span>
                    <span css={{margin:'4px'}}>say:{store!.findUserSay(follower!.serial).length}</span>
                    <span css={{margin:'4px'}}>follow:{follower!.follow.length}</span>
                    <span css={{margin:'4px'}}>follower:{follower!.follower.length}</span>
                    <span css={{margin:'4px'}}>
                        <button className="pure-button" disabled={follower!.follower.find(ee => ee === user!.serial) ? true: false} onClick={() => {
                            store!.updateUserFollow(follower!.serial).catch(err => console.error(err));
                        }}>follow</button>
                    </span>
                </div>
            </li>
        });
        return <div>
            <h3>follower list</h3>
            <ul css={{listStyleType:'none', paddingLeft:'0px'}}>
                {child}
            </ul>
        </div>
    }
}

interface FollowListContainerProps {
    store?: MyStoreType
}

@inject('store')
@observer
export default class FollowListContainer extends React.Component<FollowListContainerProps, {
    show: Boolean
}> {
    constructor(props: Readonly<FollowListContainerProps>) {
        super(props);
        this.state = {
            show: true
        };
    }
    render() {
        const child = this.state.show ? <Follow /> : <Follower />
        return <React.Fragment>
            <h2>follow/follower list</h2>
            <div>
                <button className="pure-button" onClick={() => {
                    this.setState({show: true});
                }}>follow</button>
                <span> </span>
                <button className="pure-button" onClick={() => {
                    this.setState({show: false});
                }}>follower</button>
            </div>
            <div>
                {child}
            </div>
        </React.Fragment>
    }
}