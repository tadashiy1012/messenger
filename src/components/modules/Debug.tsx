/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { css, jsx } from '@emotion/core';
import { exportData, importData, getJsonCopy } from '../../utils';
import { SettingStoreType } from '../../types';
import { history } from '../../stores';
import users from '../../stores/users';
import caches from '../../stores/caches';

interface DebugProps {
    setting?: SettingStoreType
}

@inject('setting')
@observer
export default class Debug extends React.Component<DebugProps> {
    fileRef: React.RefObject<HTMLInputElement>;
    constructor(props: Readonly<DebugProps>) {
        super(props)
        this.fileRef = React.createRef();
    }
    importClickHandler() {
        const files = this.fileRef.current!.files;
        if (files && files.length > 0) {
            const file = files[0];
            const fr = new FileReader();
            fr.onload = () => {
                const buf = fr.result;
                if (buf instanceof ArrayBuffer) {
                    importData(buf);
                }
            };
            fr.readAsArrayBuffer(file);
        }
    }
    upgradeClickHandler() {
        const copy = getJsonCopy(users.getUsers);
        copy.forEach(e => {
            e.follow = e.follow ? [...e.follow] : [];
            e.follower = e.follower ? [...e.follower] : [];
            e.like = e.like ? [...e.like] : [];
            e.notify = e.notify ? [...e.notify] : [];
        });
        users.replaceAll(copy);
    }
    render() {
        if (!this.props.setting!.showDebugMenu) {
            history.push('/');
        }
        return <React.Fragment>
            <p>
                <button onClick={() => {
                    this.upgradeClickHandler();
                }}>data upgrade</button>
            </p>
            <hr/>
            <p>
                <button onClick={() => {
                    exportData();
                }}>export</button>
            </p>
            <p>
                <input type="file" accept=".json" ref={this.fileRef} />
                <br/>
                <button onClick={() => {
                    this.importClickHandler();
                }}>import</button>
            </p>
        </React.Fragment>
    }
}