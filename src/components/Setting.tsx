/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import {css, jsx} from '@emotion/core';
import { history } from '../stores';
import { MyStoreType } from '../types';
import { noImage } from '../utils/noImageIcon';

const ICON_MAX_WIDTH = 256;
const ICON_MAX_HEIGHT = 256;

interface SettingProps {
    store?: MyStoreType
}

@inject('store')
@observer
export default class Setting extends React.Component<SettingProps> {
    nameRef: React.RefObject<HTMLInputElement>;
    iconRef: React.RefObject<HTMLInputElement>;
    passRef: React.RefObject<HTMLInputElement>;
    constructor(props: Readonly<SettingProps>) {
        super(props);
        this.nameRef = React.createRef();
        this.iconRef = React.createRef();
        this.passRef = React.createRef();
    }
    saveClickHandler() {
        const {store} = this.props;
        const newName = this.nameRef.current!.value;
        const newPass = this.passRef.current!.value;
        const files = this.iconRef.current!.files;
        console.log(files);
        const file = files ? files[0] : null;
        console.log(file);
        if (newName.length !== 0 && file) {
            const fr = new FileReader();
            fr.onload = (ev) => {
                const result = fr.result;
                if (result && typeof result === 'string') {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const image = new Image();
                    image.onload = (ev) => {
                        let width = image.width;
                        let height = image.height;
                        if (width > ICON_MAX_WIDTH && height > ICON_MAX_HEIGHT) {
                            if (image.width > image.height) {
                                const ratio = image.height / image.width;
                                width = ICON_MAX_WIDTH;
                                height = ICON_MAX_WIDTH * ratio;
                            } else {
                                const ratio = image.width / image.height;
                                width = ICON_MAX_HEIGHT * ratio;
                                height = ICON_MAX_HEIGHT;
                            }
                        }
                        canvas.width = width;
                        canvas.height = height;
                        ctx!.clearRect(0, 0, width, height);
                        ctx!.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
                        const b64 = canvas.toDataURL('image/jpeg');
                        if (newPass.length !== 0) {
                            store!.updateUser(newName, b64, newPass).then(() => {
                                alert('setting save success!');
                            }).catch((err) => {
                                console.error(err);
                                alert('setting save fail!');
                            });
                        } else {
                            store!.updateUser(newName, b64).then(() => {
                                alert('setting save success!');
                            }).catch((err) => {
                                console.error(err);
                                alert('setting save fail!');
                            });
                        }
                    };
                    image.src = result;
                } else {
                    alert('setting save fail!');
                }
            };
            fr.readAsDataURL(file);
        } else if (newName.length !== 0 && newPass.length !== 0) {
            store!.updateUser(newName, noImage, newPass).then(() => {
                alert('setting save success!');
            }).catch((err) => {
                console.error(err);
                alert('setting save fail!');
            });
        } else if (newName.length !== 0) {
            store!.updateUser(newName).then(() => {
                alert('setting save success!');
            }).catch((err) => {
                console.error(err);
                alert('setting save fail!');
            });
        }
    }
    render() {
        const {store} = this.props;
        if (!store!.logged) {
            return null;
        } else {
            const icon = store!.currentUser ? store!.currentUser.icon : noImage;
            return <React.Fragment>
                <div className="pure-form pure-form-stacked">
                    <span>screen name</span>
                    <input type="text" className="pure-input-1-3" ref={this.nameRef} />
                    <span>icon</span>
                    <br />
                    <img src={icon} css={{width:'128px', height:'128px', background:'gray'}} />
                    <input type="file" className="pure-input-1-3" ref={this.iconRef} />
                    <span>password</span>
                    <input type="password" className="pure-input-1-3" ref={this.passRef} />
                    <button className="pure-button" onClick={() => {
                        this.saveClickHandler();
                    }}>save</button>
                </div>
            </React.Fragment>
        }
    }
    componentDidMount() {
        const {store} = this.props;
        if (!store!.logged) {
            history.push('/');
        }
        if (this.nameRef.current && store!.currentUser) {
            this.nameRef.current!.value = store!.currentUser!.name
        }
    }
}