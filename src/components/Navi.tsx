/** @jsx jsx */
import * as React from 'react';
import { css, jsx } from '@emotion/core';
import { Link } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import { UserStoreType, SettingStoreType } from '../types';
import { history } from '../stores';

@inject('user', 'setting')
@observer
export default class Navi extends React.Component<{user?: UserStoreType, setting?: SettingStoreType}, {word: string}> {
    private searchRef: React.RefObject<HTMLInputElement>;
    constructor(props: Readonly<{ user?: UserStoreType | undefined; }>) {
        super(props);
        this.searchRef = React.createRef();
        this.state = {word: ''};
    }
    render() {
        const {user, setting} = this.props;
        const loggedMenu = <React.Fragment>
            <Link to={{pathname:'/user', search: user!.getUser ? '?tgt=' + user!.getUser.serial : ''}}
                className="pure-button" css={{margin:'0px 4px'}}>User</Link>
            <Link to="/setting" className="pure-button" css={{margin:'0px 4px'}}>Setting</Link>
        </React.Fragment>
        const debugMenu = <React.Fragment>
            <Link to="/debug" className="pure-button" css={{margin:'0px 4px'}}>Debug</Link>
        </React.Fragment>
        return <React.Fragment>
            <div css={{display:'flex'}}>
                <Link to="/" className="pure-button" css={{margin:'0px 4px'}}>Main</Link>
                <Link to="/login" className="pure-button" css={{margin:'0px 4px'}}>Login</Link>
                {user!.logged ? loggedMenu : null}
                {setting!.showDebugMenu ? debugMenu : null}
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
                    }}>search</Link>
                </div>
            </div>
        </React.Fragment>
    }
}