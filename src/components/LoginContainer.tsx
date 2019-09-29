/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import {css, jsx} from '@emotion/core';
import { MyStoreType } from '../types';
import Login from './Login';
import Registration from './Registration';
import LoggedContainer from './LoggedContainer';

interface LoginContainerProps {
    store?: MyStoreType
}

@inject('store')
@observer
export default class LoginContainer extends React.Component<LoginContainerProps, {login: Boolean}> {
    constructor(props: Readonly<LoginContainerProps>) {
        super(props);
        this.state = {
            login: true
        };
    }
    render() {
        const {store} = this.props;
        return <React.Fragment>
            {store!.logged ? <LoggedContainer /> : <React.Fragment>
                <div css={{display:this.state.login ? 'block':'none'}}>
                    <Login />
                    <a href="#" onClick={(ev) => {
                        ev.preventDefault();
                        this.setState({login: false});
                    }}>registration</a>
                </div>
                <div css={{display:this.state.login ? 'none':'block'}}>
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