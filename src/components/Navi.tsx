/** @jsx jsx */
import * as React from 'react';
import { css, jsx } from '@emotion/core';
import { Link } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import { UserStoreType, SettingStoreType } from '../types';
import { history } from '../stores';

const flexStyle = css({display:'flex', alignItems:'center'});
const buttonStyle = css({margin:'0px 4px'});
const notifyStyle = css({fontSize:26, color:'#aaa'});
const notifyAStyle = css({fontSize:26});
const searchBoxStyle = css({paddingLeft:8});

type LoggedMenuType = {user?: UserStoreType, logged: Boolean, notify: [string, Boolean][]};

const LoggedMenu = ({user, logged, notify}: LoggedMenuType) => {
    const notifyIcon = notify.filter(e => e[1] === true).length > 0 ? 
        <i className="material-icons" css={notifyAStyle}>notifications_active</i>
        : <i className="material-icons" css={notifyStyle}>notifications</i>;
    return logged ? (
        <React.Fragment>
            <Link to={{pathname:'/user', search: user!.getUser ? '?tgt=' + user!.getUser.serial : ''}}
                className="pure-button" css={buttonStyle}>User</Link>
            <Link to="/notification" className="pure-button" css={buttonStyle}>
                <div css={flexStyle}>{notifyIcon}</div>
            </Link>
            <Link to="/setting" className="pure-button" css={buttonStyle}>Setting</Link>
        </React.Fragment>
    ) : null;
}

const SearchMenu = ({setting}: {setting?: SettingStoreType}) => {
    let word = '';
    const searchRef = React.createRef<HTMLInputElement>();
    const searchClickHandler = () => {
        setting!.setShowSearchMode(0);
    }
    const searchKeyUpHandler = (ev: React.KeyboardEvent) => {
        if (ev.keyCode === 13) {
            history.push({pathname:'/search', search:'?word=' + word});
        }
    }
    const searchChangeHandler = () => {
        if (searchRef.current && searchRef.current.value.length > 0) {
            word = searchRef.current.value;
        }
    }
    return (
        <div className="pure-form" css={searchBoxStyle}>
            <input type="text" className="pure-input-rounded" ref={searchRef}
                onChange={searchChangeHandler} onKeyUp={searchKeyUpHandler} />
            <Link to={{pathname:'/search', search:'?word=' + word}}
                className="pure-button" css={buttonStyle} onClick={searchClickHandler}>Search</Link>
        </div>
    );
};

interface NaviProps {
    user?: UserStoreType
    setting?: SettingStoreType
}

@inject('user', 'setting')
@observer
export default class Navi extends React.Component<NaviProps> {
    render() {
        const {user, setting} = this.props;
        let notify: [string, Boolean][] = [];
        const currentUser = user!.currentUser;
        if (currentUser) {
            notify = currentUser.notify || [];
        }
        return <div css={flexStyle}>
            <Link to="/" className="pure-button" css={buttonStyle}>Main</Link>
            <Link to="/login" className="pure-button" css={buttonStyle}>Login</Link>
            <LoggedMenu user={user} logged={user!.logged} notify={notify} />
            <SearchMenu setting={setting} />
        </div>
    }
}