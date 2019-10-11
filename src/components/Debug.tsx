/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { css, jsx } from '@emotion/core';
import { exportData, importData } from '../utils';
import { SettingStoreType } from 'types';
import { history } from '../stores';

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
    render() {
        if (!this.props.setting!.showDebugMenu) {
            history.push('/');
        }
        return <React.Fragment>
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