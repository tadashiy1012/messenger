/** @jsx jsx */
import * as React from 'react';
import { css, jsx } from '@emotion/core';
import { observer, inject } from 'mobx-react';
import { history } from '../stores';
import { SettingStoreType } from 'types';
import { Finder, compareJson, getFullDateStr, escapeHtml } from '../utils';
import { Link } from 'react-router-dom';

interface SearchProps {
    setting?: SettingStoreType
}

interface SearchState {}

@inject('setting')
@observer
export default class Search extends React.Component<SearchProps, SearchState> {
    private unlisten: any;
    private prevQuery: any;
    constructor(props: Readonly<SearchProps>) {
        super(props);
        this.unlisten = history.listen((location) => {
            const {setting} = this.props;
            if (location.pathname === '/search' && location.search) {
                const query = location.search.substring(1).split('&');
                if (!compareJson(query, this.prevQuery)) {
                    this.prevQuery = [...query];
                    const tgtWord = query[0].split('=')[1];
                    setting!.setShowSearchTarget(tgtWord);
                }
            }
        });
    }
    render() {
        const {setting} = this.props;
        let child = null;
        let result = [];
        if (setting!.showSearchMode === 0) {
            result = Finder.searchSay(setting!.showSearchTarget || '');
            child = result.reverse().map((e) => {
                const name = Finder.findAuthorName(e.authorId);
                return <li key={e.id} css={{borderBottom:'solid 1px #ddd', padding:'6px', cursor:'pointer', '&:hover':{backgroundColor: '#eee'}}}>
                    <div onClick={() => { history.push({pathname:'/message', search:'?tgt=' + e.id}); }}>
                        <div css={{display:'flex', alignItems:'center'}}>
                            <Link to={{pathname:'/user', search: '?tgt=' + e.authorId}} css={{display:'flex', alignItems:'center'}} onClick={(ev) => {
                                ev.stopPropagation();
                            }}>
                                <img src={Finder.findAuthorIcon(e.authorId)} width="24" height="24" css={{
                                    borderRadius:'20px', border:'solid 1px gray', margin: '4px'}}  />
                                <span css={{margin:'0px 4px'}}>{name !== 'no_name' ? name : e.author}</span>
                            </Link>
                            <span css={{color:'#999', fontSize:'13px', margin:'0px 4px'}}>
                                {getFullDateStr(e.date)}
                            </span>
                        </div>
                        <div css={{marginLeft:'22px', padding:'6px'}}>
                            <span dangerouslySetInnerHTML={{__html: escapeHtml(e.say).replace('\n', '<br/>')}}></span>
                        </div>
                        <div css={{display:'flex', justifyContent:'space-around', fontSize:'11px', color:'#999'}}>
                            <div css={{display:'flex', alignItems:'center'}}>
                                <i className="material-icons">message</i>
                                <span>reply:{e.reply.length}</span>
                            </div>
                            <div css={{display:'flex', alignItems:'center'}}>
                                <i className="material-icons">favorite</i>
                                <span>like:{e.like.length}</span>
                            </div>
                        </div>
                    </div>
                </li>
            });
        } else {
            result = Finder.searchUser(setting!.showSearchTarget || '');
            child = result.reverse().map((e) => {
                return <li key={e.serial} css={{borderBottom:'solid 1px #ccc', padding:'16px', cursor:'pointer', '&:hover':{backgroundColor: '#eee'}}}>
                    <div css={{display:'grid', gridTemplateColumns:'180px 320px 230px'}} onClick={() => {
                        history.push({pathname:'/user', search:'?tgt=' + e.serial})
                    }}>
                        <div css={{display:'flex', alignItems:'center'}}>
                            <Link to={{pathname:'/user', search: '?tgt=' + e.serial}} css={{
                                display:'flex', alignItems:'center'
                            }} onClick={(ev) => {
                                ev.stopPropagation();
                            }}>
                                <img src={e.icon} alt="icon" width="36" height="36" css={{borderRadius:'36px', border:'solid 1px gray'}} />
                                <span css={{margin:'4px'}}>{e.name}</span>
                            </Link>
                        </div>
                        <div css={{display:'flex', alignItems:'center'}}><span css={{margin:'6px'}}>{e.profile || ''}</span></div>
                        <div css={{display:'flex', alignItems:'center'}}> 
                            <span css={{margin:'4px'}}>say:{0}</span>
                            <span css={{margin:'4px'}}>follow:{e.follow.length}</span>
                            <span css={{margin:'4px'}}>follower:{e.follower.length}</span>
                        </div>
                    </div>
                </li>
            });
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
                {setting!.showSearchMode === 0 ? 'message':'user'} result count: {result.length}</p>
            <ul css={{listStyleType:'none', paddingLeft:'0px'}}>
                {child}
            </ul>
        </React.Fragment>
    }
    componentDidMount() {
        const {setting} = this.props;
        if (history && setting) {
            const params = history.location.search.substring(1).split('&');
            if (params.length > 0) {
                const tgtWord = params[0].split('=')[1];
                setting.setShowSearchTarget(tgtWord);
            }
        }
    }
    componentWillUnmount() {
        this.unlisten();
    }
}