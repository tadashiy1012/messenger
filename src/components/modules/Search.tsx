/** @jsx jsx */
import * as React from 'react';
import { css, jsx } from '@emotion/core';
import { observer, inject } from 'mobx-react';
import { history } from '../../stores';
import { SettingStoreType, UserStoreType } from '../../types';
import { Finder, compareJson, getAlike, getNALike } from '../../utils';
import { Line, LineUsr } from '../parts';

const ulStyle = css({listStyleType:'none', paddingLeft:'0px'});

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
    render() {
        const {setting, user} = this.props;
        let child = null;
        let count = 0;
        if (setting!.showSearchMode === 0) {
            const crntUser = user!.currentUser;
            const src = Finder.searchSay(setting!.showSearchTarget || '');
            child = src.map((e) => {
                const like = user!.logged && crntUser && crntUser.serial !== e.authorId ? 
                    getAlike(crntUser, e, user!) : getNALike(crntUser, e);
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
            child = src.map((e) => {
                let count = 0;
                const tgt = this.state.sayCount.find(ee => ee[0] === e.serial);
                if (tgt) count = tgt[1];
                return <LineUsr key={e.serial} usr={e} count={count} />
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
            <ul css={ulStyle}>
                {child}
            </ul>
        </React.Fragment>
    }
    componentDidMount() {
        const {setting} = this.props;
        const location = history.location;
        if (location.pathname === '/search' && location.search) {
            const query = location.search.substring(1).split('&');
            if (!compareJson(query, this.prevQuery)) {
                this.prevQuery = [...query];
                const tgtWord = query[0].split('=')[1];
                setting!.setShowSearchTarget(tgtWord);
                this.setState({flg: true});
            }
        }
    }
    componentWillUnmount() {
        this.unlisten();
    }
}