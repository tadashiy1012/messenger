/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import {css, jsx} from '@emotion/core';
import { UserStoreType } from '../types';
import Login from './Login';
import Registration from './Registration';
import Logout from './Logout';

interface LoginContainerProps {
    user?: UserStoreType
}

@inject('user')
@observer
export default class LoginContainer extends React.Component<LoginContainerProps, {login: Boolean}> {
    constructor(props: Readonly<LoginContainerProps>) {
        super(props);
        this.state = {
            login: true
        };
    }
    render() {
        const {user} = this.props;
        return <React.Fragment>
            {user!.logged ? <Logout /> : <React.Fragment>
                <div css={{display:this.state.login ? 'block':'none', margin:'12px 0px'}}>
                    <Login />
                    <a href="#" onClick={(ev) => {
                        ev.preventDefault();
                        this.setState({login: false});
                    }}>registration</a>
                </div>
                <div css={{display:this.state.login ? 'none':'block', margin:'12px 0px'}}>
                    <Registration />
                    <a href="#" onClick={(ev) => {
                        ev.preventDefault();
                        this.setState({login: true});
                    }}>login</a>
                </div>
            </React.Fragment>}
        </React.Fragment>
    }
}