/** @jsx jsx */
import * as React from 'react';
import {css, jsx} from '@emotion/core';
import { UserStoreType } from '../types';
import { history } from '../stores';

interface LoginProps {
    user?: UserStoreType
}

export default function Login({user}: LoginProps) {
    const emailRef: React.RefObject<HTMLInputElement> = React.createRef();
    const passRef: React.RefObject<HTMLInputElement> = React.createRef();
    const loginClickHandler = () => {
        const email = emailRef.current!.value;
        const password = passRef.current!.value;
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
    return <React.Fragment>
        <div className="pure-form pure-form-stacked" css={{margin:'12px 0px'}}>
            <h3 css={{marginBottom:'2px'}}>login</h3>
            <span>email</span>
            <input type="email" className="pure-input-1-3" ref={emailRef} />
            <span>password</span>
            <input type="password" className="pure-input-1-3" ref={passRef} onKeyUp={(ev) => {
                if (ev.keyCode === 13) {
                    loginClickHandler();
                }
            }} />
            <button className="pure-button" onClick={(ev) => {
                loginClickHandler();
            }}>login</button>
        </div>
    </React.Fragment>
}