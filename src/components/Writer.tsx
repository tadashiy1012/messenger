/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import {css, jsx} from '@emotion/core';
import * as uuid from 'uuid';
import { SayType, UserStoreType, SayStoreType } from '../types';
import { Finder } from '../utils';
import { noImage } from '../utils/noImageIcon';
import { Link } from 'react-router-dom';
import users from 'stores/users';

interface WriterProps {
    user?: UserStoreType
    say?: SayStoreType
}

@inject('user', 'say')
@observer
export default class Writer extends React.Component<WriterProps> {
    private _inSayRef: React.RefObject<HTMLTextAreaElement>;
    constructor(props: Readonly<WriterProps>) {
        super(props);
        this._inSayRef = React.createRef<HTMLTextAreaElement>();
    }
    sendClickHandler(ev: React.MouseEvent) {
        console.log(this._inSayRef.current!.value);
        const {user, say} = this.props;
        if (user && user.currentUser) {
            const {serial, name} = user.currentUser;
            const value = this._inSayRef.current!.value;
            const newSay: SayType = {
                id: uuid.v1(),
                date: Date.now(),
                author: name,
                authorId: serial,
                like: [],
                reply: [],
                say: value
            };
            say!.addSay(newSay);
            const result = value.match(/^@[A-Za-z].+(\s|\n)/);
            if (result) {
                const tgtName = result[0].substring(1, result[0].length - 1);
                const tgtUser = Finder.findUserByName(tgtName);
                if (tgtUser) {
                    const copy = Object.assign({}, tgtUser);
                    if (!copy.notify) copy.notify = [];
                    copy.notify.push([newSay.id, true]);
                    users.update(copy);
                }
            }
        } else {
            alert('say send fail!!');
        }
    }
    render() {
        const {user} = this.props;
        return <div className="pure-form" css={{display:'flex', alignItems:'center', margin:'14px 0px'}}>
            <Link to={{pathname:'/user', search: '?tgt=' + user!.getUser!.serial}}>
                <img src={user!.currentUser ? user!.currentUser.icon : noImage} width="32" height="32" css={{
                    borderRadius:'20px', border:'solid 1px gray', margin:'0px 4px'}} />
            </Link>
            <span>{user!.currentUser ? user!.currentUser.name : 'no_name'}'s say: </span>
            <textarea className="pure-input pure-input-1-3"
                css={{margin:'0px 4px'}}
                ref={this._inSayRef} disabled={user!.logged ? false:true}></textarea>
            <button className="pure-button" 
                onClick={(ev) => {this.sendClickHandler(ev)}} 
                disabled={user!.logged ? false : true}>send</button>
        </div>
    }
}