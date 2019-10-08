/** @jsx jsx */
import React from "react";
import { css, jsx } from '@emotion/core';
import { observer } from "mobx-react";
import { UserType } from "../types";
import { Finder } from '../utils'
import { Link } from "react-router-dom";

interface FollowProps {
    tgtUser: UserType
}

@observer
class Follow extends React.Component<FollowProps, {follows:{id:string, sayLen:number}[]}> {
    constructor(props: Readonly<FollowProps>) {
        super(props);
        this.state = {
            follows: []
        };
    }
    render() {
        const {tgtUser} = this.props;
        const child = tgtUser.follow.map(e => {
            const found = this.state.follows.find(ee => ee.id === e);
            const sayCount = found ? found.sayLen : 0;
            const follow = Finder.findUser(e);
            if (follow) {
                return <li key={e} css={{margin:'6px 0px', borderBottom:'solid 1px #ccc', padding:'6px'}}>
                    <div css={{display:'grid', gridTemplateColumns:'180px 320px 230px'}}>
                        <div css={{display:'flex', alignItems:'center'}}>
                            <Link to={{pathname:'/user', search: '?tgt=' + e}} css={{
                                display:'flex', alignItems:'center'
                            }}>
                                <img src={follow.icon} alt="icon" width="36" height="36" css={{borderRadius:'36px', border:'solid 1px gray'}} />
                                <span css={{margin:'4px'}}>{follow.name}</span>
                            </Link>
                        </div>
                        <div><span css={{margin:'6px'}}>sample profile sample profile<br />sample profile sample profile</span></div>
                        <div css={{display:'flex', alignItems:'center'}}> 
                            <span css={{margin:'4px'}}>say:{sayCount}</span>
                            <span css={{margin:'4px'}}>follow:{follow.follow.length}</span>
                            <span css={{margin:'4px'}}>follower:{follow.follower.length}</span>
                        </div>
                    </div>
                </li>
            } else {
                return null;
            }
        });
        return <ul css={{listStyleType:'none', paddingLeft:'0px'}}>{child}</ul>
    }
    componentDidMount() {
        const {tgtUser} = this.props;
        const follows = [...this.state.follows];
        tgtUser.follow.forEach(e => {
            Finder.findUserSay(e).then((resp) => {
                follows.push({id: e, sayLen: resp.length});
                this.setState({follows: follows});
            });
        });
    }
}

interface FollowerProps {
    tgtUser: UserType
}

@observer
class Follower extends React.Component<FollowerProps, {followers:{id:string, sayLen:number}[]}> {
    constructor(props: Readonly<FollowerProps>) {
        super(props);
        this.state = {
            followers: []
        };
    }
    render() {
        const {tgtUser} = this.props;
        const child = tgtUser.follower.map(e => {
            const found = this.state.followers.find(ee => ee.id === e);
            const sayCount = found ? found.sayLen : 0;
            const follower = Finder.findUser(e);
            if (follower) {
                return <li key={e} css={{margin:'6px 0px', borderBottom:'solid 1px #ccc', padding:'6px'}}>
                    <div css={{display:'grid', gridTemplateColumns:'180px 320px 230px'}}>
                        <div css={{display:'flex', alignItems:'center'}}>
                            <Link to={{pathname:'/user', search: '?tgt=' + e}} css={{
                                display:'flex', alignItems:'center'
                            }}>
                                <img src={follower.icon} alt="icon" width="36" height="36" css={{borderRadius:'36px', border:'solid 1px gray'}} />
                                <span css={{margin:'4px'}}>{follower.name}</span>
                            </Link>
                        </div>
                        <div><span css={{margin:'6px'}}>sample profile sample profile<br />sample profile sample profile</span></div>
                        <div css={{display:'flex', alignItems:'center'}}> 
                            <span css={{margin:'4px'}}>say:{sayCount}</span>
                            <span css={{margin:'4px'}}>follow:{follower.follow.length}</span>
                            <span css={{margin:'4px'}}>follower:{follower.follower.length}</span>
                        </div>
                    </div>
                </li>
            } else {
                return null;
            }
        });
        return <ul css={{listStyleType:'none', paddingLeft:'0px'}}>{child}</ul>
    }
    componentDidMount() {
        const {tgtUser} = this.props;
        const followers = [...this.state.followers];
        tgtUser.follower.forEach(e => {
            Finder.findUserSay(e).then((resp) => {
                followers.push({id: e, sayLen: resp.length});
                this.setState({followers: followers});
            });
        });
    }
}

export {
    Follow,
    Follower,
};