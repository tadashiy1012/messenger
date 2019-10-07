/** @jsx jsx */
import * as React from 'react';
import { css, jsx } from '@emotion/core';
import { Link } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import { UserStoreType } from '../types';

@inject('user')
@observer
export default class Navi extends React.Component<{user?: UserStoreType}> {
    render() {
        const {user} = this.props;
        const loggedMenu = <React.Fragment>
            <Link to={{pathname:'/user', search: user!.getUser ? '?tgt=' + user!.getUser.serial : ''}}
                className="pure-button" css={{margin:'0px 4px'}}>User</Link>
            <Link to="/setting" className="pure-button" css={{margin:'0px 4px'}}>Setting</Link>
        </React.Fragment>
        return <React.Fragment>
            <div css={{display:'flex'}}>
                <Link to="/" className="pure-button" css={{margin:'0px 4px'}}>Main</Link>
                <Link to="/login" className="pure-button" css={{margin:'0px 4px'}}>Login</Link>
                {user!.logged ? loggedMenu : null}
            </div>
        </React.Fragment>
    }
}