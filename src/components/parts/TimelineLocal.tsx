/** @jsx jsx */
import * as React from 'react';
import { jsx, css } from '@emotion/core';
import { UserStoreType, SayType } from '../../types';
import { makeTlChild } from '../../utils'

interface LocalProps {
    user?: UserStoreType
    timeline: SayType[]
    num: number
    numUp: () => void
}

export default function LocalTL({user, timeline, num, numUp}: LocalProps) {
    const idSet = user!.logged ? 
        new Set<string>([
            user!.currentUser.serial, 
            ...user!.currentUser.follow
        ]) : new Set<string>();
    const ids: Array<String> = Array.from(idSet);
    const tl = [...timeline].filter(e => {
        const found = ids.find(ee => ee === e.authorId);
        return found ? true:false;
    }).reverse().slice(0, num);
    return <div css={{width:'48%', display:user!.logged ? 'block':'none'}}>
        <h4 css={{margin:'2px 0px'}}>local timeline</h4>
        <ul css={{listStyleType:'none', padding:'0px'}}>{makeTlChild(user!, tl)}</ul>
        <div css={{display:'flex', justifyContent:'center'}}>
            <button className="pure-button" onClick={() => {numUp()}}>view more</button>
        </div>
    </div>
}