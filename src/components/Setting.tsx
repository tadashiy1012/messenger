/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import {css, jsx} from '@emotion/core';
import { history } from '../stores';
import { UserStoreType } from '../types';
import { noImage } from '../utils/noImageIcon';
import { createImage } from '../utils';

interface SettingProps {
    user?: UserStoreType
}

@inject('user')
@observer
export default class Setting extends React.Component<SettingProps> {
    nameRef: React.RefObject<HTMLInputElement>;
    iconRef: React.RefObject<HTMLInputElement>;
    passRef: React.RefObject<HTMLInputElement>;
    profRef: React.RefObject<HTMLTextAreaElement>;
    constructor(props: Readonly<SettingProps>) {
        super(props);
        this.nameRef = React.createRef();
        this.iconRef = React.createRef();
        this.passRef = React.createRef();
        this.profRef = React.createRef();
    }
    saveClickHandler() {
        const {user} = this.props;
        const newName = this.nameRef.current!.value;
        const newPass = this.passRef.current!.value;
        const prof = this.profRef.current!.value || '';
        const files = this.iconRef.current!.files;
        const file = files ? files[0] : null;
        if (newName.length !== 0 && file) {
            const fr = new FileReader();
            fr.onload = (ev) => {
                const result = fr.result;
                if (result && typeof result === 'string') {
                    createImage(result, (b64) => {
                        if (newPass.length !== 0) {
                            user!.updateUser(newName, b64, newPass).then(() => {
                                return user!.updateUserProfile(prof);
                            }).then(() => {
                                alert('setting save success!');
                            }).catch((err) => {
                                console.error(err);
                                alert('setting save fail!');
                            });
                        } else {
                            user!.updateUser(newName, b64).then(() => {
                                return user!.updateUserProfile(prof);
                            }).then(() => {
                                alert('setting save success!');
                            }).catch((err) => {
                                console.error(err);
                                alert('setting save fail!');
                            });
                        }
                    });
                } else {
                    alert('setting save fail!');
                }
            };
            fr.readAsDataURL(file);
        } else if (newName.length !== 0 && newPass.length !== 0) {
            user!.updateUser(newName, noImage, newPass).then(() => {
                return user!.updateUserProfile(prof);
            }).then(() => {
                alert('setting save success!');
            }).catch((err) => {
                console.error(err);
                alert('setting save fail!');
            });
        } else if (newName.length !== 0) {
            user!.updateUser(newName).then(() => {
                return user!.updateUserProfile(prof);
            }).then(() => {
                alert('setting save success!');
            }).catch((err) => {
                console.error(err);
                alert('setting save fail!');
            });
        }
    }
    render() {
        const {user} = this.props;
        if (!user!.logged) {
            return null;
        } else {
            const icon = user!.currentUser ? user!.currentUser.icon : noImage;
            return <React.Fragment>
                <div className="pure-form pure-form-stacked">
                    <span>screen name</span>
                    <input type="text" className="pure-input-1-3" ref={this.nameRef} />
                    <span>icon</span>
                    <br />
                    <img src={icon} css={{width:'128px', height:'128px', background:'gray'}} />
                    <input type="file" className="pure-input-1-3" ref={this.iconRef} />
                    <span>password</span>
                    <input type="password" className="pure-input-1-3" ref={this.passRef} placeholder="new password"/>
                    <span>profile</span>
                    <textarea cols={30} rows={3} ref={this.profRef}></textarea>
                    <button className="pure-button" onClick={() => {
                        this.saveClickHandler();
                    }}>save</button>
                </div>
            </React.Fragment>
        }
    }
    componentDidMount() {
        const {user} = this.props;
        if (!user!.logged) {
            history.push('/');
        }
        if (this.nameRef.current && user && user.currentUser) {
            this.nameRef.current.value = user.currentUser.name;
        }
        if (this.profRef.current && user && user.currentUser) {
            this.profRef.current.value = user.currentUser.profile || '';
        }
    }
}