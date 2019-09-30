/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import {css, jsx} from '@emotion/core';
import * as uuid from 'uuid';
import { SayType, MyStoreType } from '../types';
import { noImage } from '../utils/noImageIcon';
import { ShowMode } from '../enums';

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
        if (store && store.currentUser) {
            const {serial, name} = store.currentUser;
            const say: SayType = {
                id: uuid.v1(),
                date: Date.now(),
                author: name,
                authorId: serial,
                say: this._inSayRef.current!.value
            };
            store!.addSay(say).catch((err) => {
                console.error(err);
                alert('say send fail!!');
            });
        } else {
            alert('say send fail!!');
        }
    }
    render() {
        const {store} = this.props;
        return <div className="pure-form" css={{display:'flex', alignItems:'center'}}>
            <a href="#" onClick={(ev) => {
                ev.preventDefault();
                const user = store!.getUser;
                store!.setShowUserTarget(user!.serial);
                store!.setShowMode(ShowMode.USER);
            }}>
                <img src={store!.currentUser ? store!.currentUser.icon : noImage} width="32" height="32" css={{
                    borderRadius:'20px', border:'solid 1px gray', margin:'0px 4px'}} />
            </a>
            <span>{store!.currentUser ? store!.currentUser.name : 'no_name'}'s say: </span>
            <textarea className="pure-input pure-input-1-3"
                css={{margin:'0px 4px'}}
                ref={this._inSayRef} disabled={store!.logged ? false:true}></textarea>
            <button className="pure-button" 
                onClick={(ev) => {this.sendClickHandler(ev)}} 
                disabled={store!.logged ? false : true}>send</button>
        </div>
    }
}