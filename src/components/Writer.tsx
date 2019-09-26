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
    private _inSayRef: React.RefObject<HTMLTextAreaElement>;
    constructor(props: Readonly<WriterProps>) {
        super(props);
        this._inSayRef = React.createRef<HTMLTextAreaElement>();
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
        return <div className="pure-form" css={{display:'flex', alignItems:'center'}}>
            <img src={store!.icon} width="32" height="32" css={{
                borderRadius:'20px', border:'solid 1px gray', margin:'0px 4px'}} />
            <span>{store!.name}'s say: </span>
            <textarea className="pure-input pure-input-1-3"
                css={{margin:'0px 4px'}}
                ref={this._inSayRef} disabled={store!.logged ? false:true}></textarea>
            <button className="pure-button" 
                onClick={(ev) => {this.sendClickHandler(ev)}} 
                disabled={store!.logged ? false : true}>send</button>
        </div>
    }
}