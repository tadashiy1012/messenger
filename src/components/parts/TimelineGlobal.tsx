/** @jsx jsx */
import * as React from 'react';
import { jsx, css } from '@emotion/core';
import { UserStoreType, SayType } from '../../types';
import { makeTlChild } from '../../utils'

interface GlobalProps {
    user?: UserStoreType
    timeline: SayType[]
    num: number
    numUp: () => void
}

export default function GlobalTL({user, timeline, num, numUp}: GlobalProps) {
    const tl = [...timeline].reverse().slice(0, num);
    return <div css={{width:user!.logged ? '48%':'100%'}}>
        <h4 css={{margin:'2px 0px'}}>global timeline</h4>
        <ul css={{listStyleType:'none', padding:'0px'}}>{makeTlChild(user!, tl)}</ul>
        <div css={{display:'flex', justifyContent:'center'}}>
            <button className="pure-button" onClick={() => {numUp()}}>view more</button>
        </div>
    </div>
}