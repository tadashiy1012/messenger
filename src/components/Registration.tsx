/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import {css, jsx} from '@emotion/core';
import { MyStoreType } from '../types';

interface RegistrationProps {
    store?: MyStoreType
}

@inject('store')
@observer
export default class Registration extends React.Component<RegistrationProps> {
    private emailRef: React.RefObject<HTMLInputElement>;
    private passRef: React.RefObject<HTMLInputElement>;
    private nameRef: React.RefObject<HTMLInputElement>;
    constructor(props: Readonly<RegistrationProps>) {
        super(props);
        this.emailRef = React.createRef();
        this.passRef = React.createRef();
        this.nameRef = React.createRef();
    }
    registrationClickHandler(ev: React.MouseEvent) {
        const {store} = this.props;
        const email = this.emailRef.current!.value;
        const password = this.passRef.current!.value;
        const name = this.nameRef.current!.value;
        store!.registration(name, email, password).then((result) => {
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
    render() {
        return <React.Fragment>
            <div className="pure-form pure-form-stacked" css={{margin:'12px 0px'}}>
                <h3 css={{marginBottom:'2px'}}>registration</h3>
                <span>email</span>
                <input type="email" className="pure-input-1-3" ref={this.emailRef} />
                <span>password</span>
                <input type="password" className="pure-input-1-3" ref={this.passRef} />
                <span>screen name</span>
                <input type="text" className="pure-input-1-3" ref={this.nameRef} />
                <button className="pure-button" onClick={(ev) => {
                    this.registrationClickHandler(ev)
                }}>
                    registration
                </button>
            </div>
        </React.Fragment>
    }
}