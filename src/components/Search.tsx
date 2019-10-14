/** @jsx jsx */
import * as React from 'react';
import { css, jsx } from '@emotion/core';
import { observer, inject } from 'mobx-react';
import { history } from '../stores';
import { SettingStoreType, UserStoreType, SayType, UserType } from '../types';
import { Finder, compareJson } from '../utils';
import { Link } from 'react-router-dom';
import Line from './Line';

const liStyle = css({borderBottom:'solid 1px #ccc', padding:'16px', cursor:'pointer', '&:hover':{backgroundColor: '#eee'}});
const bodyStyle = css({display:'grid', gridTemplateColumns:'180px 320px 230px'});
const imgStyle = css({borderRadius:'36px', border:'solid 1px gray'});
const flexCenter = css({display:'flex', alignItems:'center'});
const margin4px = css({margin:'4px'});

const UserLi = ({usr, count}: {usr: UserType, count: number}) => (
    <li css={liStyle}>
        <div css={bodyStyle} onClick={() => {
            history.push({pathname:'/user', search:'?tgt=' + usr.serial})
        }}>
            <div css={flexCenter}>
                <Link to={{pathname:'/user', search: '?tgt=' + usr.serial}} css={flexCenter} onClick={(ev) => {
                    ev.stopPropagation();
                }}>
                    <img src={usr.icon} alt="icon" width="36" height="36" css={imgStyle} />
                    <span css={margin4px}>{usr.name}</span>
                </Link>
            </div>
            <div css={flexCenter}><span css={{margin:'6px'}}>{usr.profile || ''}</span></div>
            <div css={flexCenter}> 
                <span css={margin4px}>say:{count}</span>
                <span css={margin4px}>follow:{usr.follow.length}</span>
                <span css={margin4px}>follower:{usr.follower.length}</span>
            </div>
        </div>
    </li>
);

interface SearchProps {
    setting?: SettingStoreType
    user?: UserStoreType
}

interface SearchState {
    flg: Boolean
    sayCount: [string, number][]
}

@inject('setting', 'user')
@observer
export default class Search extends React.Component<SearchProps, SearchState> {
    private unlisten: any;
    private prevQuery: any;
    constructor(props: Readonly<SearchProps>) {
        super(props);
        this.state = {
            flg: true,
            sayCount: []
        };
        this.unlisten = history.listen((location) => {
            const {setting} = this.props;
            if (location.pathname === '/search' && location.search) {
                const query = location.search.substring(1).split('&');
                if (!compareJson(query, this.prevQuery)) {
                    this.prevQuery = [...query];
                    const tgtWord = query[0].split('=')[1];
                    setting!.setShowSearchTarget(tgtWord);
                    this.setState({flg: true});
                }
            }
        });
    }
    likeClickHandler(tgt: SayType) {
        const {user} = this.props;
        user!.updateUserLike(tgt).catch(err => console.error(err));
    }
    unLikeClickHandler(tgt: SayType) {
        const {user} = this.props;
        user!.updateUserUnLike(tgt).catch(err => console.error(err));
    }
    render() {
        const {setting, user} = this.props;
        let child = null;
        let count = 0;
        if (setting!.showSearchMode === 0) {
            const crntUser = user!.currentUser;
            const src = Finder.searchSay(setting!.showSearchTarget || '');
            child = src.reverse().map((e) => {
                const alike = crntUser && e.like.find(ee => ee === crntUser!.serial) ? 
                    <i className="material-icons" css={{cursor:'pointer'}} onClick={() => {
                        this.unLikeClickHandler(e)}}>favorite</i> :
                    <i className="material-icons" css={{cursor:'pointer'}} onClick={() => {
                        this.likeClickHandler(e)}}>favorite_border</i>;
                const naLike = crntUser && e.like.find(ee => ee === crntUser!.serial) ? 
                    <i className="material-icons">favorite</i> :
                    <i className="material-icons">favorite_border</i>;
                const like = user!.logged && crntUser && crntUser.serial !== e.authorId ? alike : naLike;
                const name = Finder.findAuthorName(e.authorId);
                const icon = Finder.findAuthorIcon(e.authorId);
                return <Line key={e.id} name={name} authorIcon={icon} say={e} likeIcon={like} />
            });
            count = child.length;
        } else {
            const src = Finder.searchUser(setting!.showSearchTarget || '');
            const tasks = src.map(e => {
                return new Promise<[string, number]>((resolve) => {
                    (async () => {
                        resolve([e.serial, (await Finder.findUserSay(e.serial)).length]);
                    })();
                });
            });
            Promise.all(tasks).then((results) => {
                if (this.state.flg) {
                    this.setState({sayCount: results, flg: false});
                }
            });
            child = src.reverse().map((e) => {
                let count = 0;
                const tgt = this.state.sayCount.find(ee => ee[0] === e.serial);
                if (tgt) count = tgt[1];
                return <UserLi key={e.serial} usr={e} count={count} />
            });
            count = child.length;
        }
        return <React.Fragment>
            <div>
                <button className="pure-button" onClick={() => {
                    setting!.setShowSearchMode(0);
                }}>message search</button>
                <span> </span>
                <button className="pure-button" onClick={() => {
                    setting!.setShowSearchMode(1);
                }}>user search</button>
            </div>
            <p>keyword "<b>{setting!.showSearchTarget}</b>" mode: 
                {setting!.showSearchMode === 0 ? 'message':'user'} result count: {count}</p>
            <ul css={{listStyleType:'none', paddingLeft:'0px'}}>
                {child}
            </ul>
        </React.Fragment>
    }
    componentWillUnmount() {
        this.unlisten();
    }
}