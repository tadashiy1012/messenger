/** @jsx jsx */
import * as React from 'react';
import {css, jsx} from '@emotion/core';
import { UserStoreType } from '../types';

interface RegistrationProps {
    user?: UserStoreType
}

export default function Registration({user}: RegistrationProps) {
    const emailRef: React.RefObject<HTMLInputElement> = React.createRef();
    const passRef: React.RefObject<HTMLInputElement> = React.createRef();
    const nameRef: React.RefObject<HTMLInputElement> = React.createRef();
    const registrationClickHandler = () => {
        const email = emailRef.current!.value;
        const password = passRef.current!.value;
        const name = nameRef.current!.value;
        user!.registration(name, email, password).then((result) => {
            if (result) {
                alert('registration success!');
            } else {
                alert('registration fail!');
            }
        }).catch((err) => {
            console.error(err);
            alert('registration fail');
        });
    };
    return <React.Fragment>
        <div className="pure-form pure-form-stacked" css={{margin:'12px 0px'}}>
            <h3 css={{marginBottom:'2px'}}>registration</h3>
            <span>email</span>
            <input type="email" className="pure-input-1-3" ref={emailRef} />
            <span>name</span>
            <input type="text" className="pure-input-1-3" ref={nameRef} />
            <span>password</span>
            <input type="password" className="pure-input-1-3" ref={passRef} />
            <button className="pure-button" onClick={() => {
                registrationClickHandler()
            }}>
                registration
            </button>
        </div>
    </React.Fragment>
}