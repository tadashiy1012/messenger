/** @jsx jsx */
import * as React from 'react';
import { css, jsx } from '@emotion/core';
import { Link } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import { UserStoreType, SettingStoreType } from '../types';
import { history } from '../stores';

interface NaviProps {
    user?: UserStoreType
    setting?: SettingStoreType
}

@inject('user', 'setting')
@observer
export default class Navi extends React.Component<NaviProps, {word: string}> {
    private searchRef: React.RefObject<HTMLInputElement>;
    constructor(props: Readonly<NaviProps>) {
        super(props);
        this.searchRef = React.createRef();
        this.state = {word: ''};
    }
    render() {
        const {user, setting} = this.props;
        let notifyIcon = null
        if (user!.currentUser) {
            const notify = user!.currentUser.notify || [];
            notifyIcon = notify.filter(e => e[1] === true).length > 0 ? 
                <i className="material-icons" css={{fontSize:'26px'}}>notifications_active</i>
                : <i className="material-icons" css={{fontSize:'26px', color:'#aaa'}}>notifications</i>
        }
        const loggedMenu = <React.Fragment>
            <Link to={{pathname:'/user', search: user!.getUser ? '?tgt=' + user!.getUser.serial : ''}}
                className="pure-button" css={{margin:'0px 4px'}}>User</Link>
            <Link to="/notification" className="pure-button" css={{margin:'0px 4px'}}>
                <div css={{display:'flex', alignItems:'center'}}>
                    {notifyIcon}
                </div>
            </Link>
            <Link to="/setting" className="pure-button" css={{margin:'0px 4px'}}>Setting</Link>
        </React.Fragment>
        return <React.Fragment>
            <div css={{display:'flex'}}>
                <Link to="/" className="pure-button" css={{margin:'0px 4px'}}>Main</Link>
                <Link to="/login" className="pure-button" css={{margin:'0px 4px'}}>Login</Link>
                {user!.logged ? loggedMenu : null}
                <div className="pure-form" css={{paddingLeft:'8px'}}>
                    <input type="text" className="pure-input-rounded" ref={this.searchRef} onChange={(ev) => {
                        if (this.searchRef.current && this.searchRef.current.value.length > 0) {
                            this.setState({word: this.searchRef.current.value});
                        }
                    }} onKeyUp={(ev) => {
                        if (ev.keyCode === 13) {
                            history.push({pathname:'/search', search:'?word=' + this.state.word});
                        }
                    }} />
                    <Link to={{pathname:'/search', search:'?word=' + this.state.word}}
                        className="pure-button" css={{margin:'0px 4px'}} onClick={() => {
                        setting!.setShowSearchMode(0);
                    }}>Search</Link>
                </div>
            </div>
        </React.Fragment>
    }
}