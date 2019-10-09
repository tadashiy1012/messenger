/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import {css, jsx} from '@emotion/core';
import { UserStoreType } from '../types';
import { history } from '../stores';

interface LoginProps {
    user?: UserStoreType
}

@inject('user')
@observer
export default class Login extends React.Component<LoginProps> {
    emailRef: React.RefObject<HTMLInputElement>;
    passRef: React.RefObject<HTMLInputElement>;
    constructor(props: Readonly<LoginProps>) {
        super(props);
        this.emailRef = React.createRef();
        this.passRef = React.createRef();
    }
    loginClickHandler() {
        const {user} = this.props;
        const email = this.emailRef.current!.value;
        const password = this.passRef.current!.value;
        user!.login(email, password).then((result) => {
            if (result) {
                user!.setLogged(true);
                history.push('/');
            } else {
                alert('login fail!');
            }
        }).catch((err) => {
            console.error(err);
            alert('login fail!');
        });
    }
    render() {
        return <React.Fragment>
            <div className="pure-form pure-form-stacked" css={{margin:'12px 0px'}}>
                <h3 css={{marginBottom:'2px'}}>login</h3>
                <span>email</span>
                <input type="email" className="pure-input-1-3" ref={this.emailRef} />
                <span>password</span>
                <input type="password" className="pure-input-1-3" ref={this.passRef} onKeyUp={(ev) => {
                    if (ev.keyCode === 13) {
                        this.loginClickHandler();
                    }
                }} />
                <button className="pure-button" onClick={(ev) => {
                    this.loginClickHandler();
                }}>login</button>
            </div>
        </React.Fragment>
    }
}