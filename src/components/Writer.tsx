/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import {css, jsx} from '@emotion/core';
import * as uuid from 'uuid';
import { MyStoreType } from '../store';
import { SayType } from '../types';

interface WriterProps {
    store?: MyStoreType
}

@inject('store')
@observer
export default class Writer extends React.Component<WriterProps> {
    private _inSayRef: React.RefObject<HTMLInputElement>;
    constructor(props: Readonly<WriterProps>) {
        super(props);
        this._inSayRef = React.createRef<HTMLInputElement>();
    }
    sendClickHandler(ev: React.MouseEvent) {
        console.log(this._inSayRef.current!.value);
        const {store} = this.props;
        const say: SayType = {
            id: uuid.v1(),
            date: Date.now(),
            author: store!.name,
            authorId: store!.serial,
            say: this._inSayRef.current!.value
        };
        store!.addSay(say).catch((err) => {
            console.error(err);
            alert('say send fail!!');
        });
    }
    render() {
        const {store} = this.props;
        return <div className="pure-form">
            <label>
                <span>{store!.name}'s say: </span>
                <input type="text"  className="pure-input-rounded pure-input-1-3"
                    ref={this._inSayRef} disabled={store!.logged ? false:true} />
            </label>
            <span> </span>
            <button className="pure-button" 
                onClick={(ev) => {this.sendClickHandler(ev)}} 
                disabled={store!.logged ? false : true}>send</button>
        </div>
    }
}