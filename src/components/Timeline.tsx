/** @jsx jsx */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import {css, jsx} from '@emotion/core';
import { MyStoreType } from '../store';


function escape_html (string: string): string {
    if(typeof string !== 'string') {
        return string;
    }
    return string.replace(/[&'`"<>]/g, (match) => {
        switch (match) {
            case '&':
                return '&amp;';
            case "'": 
                return '&#x27;';
            case '`':
                return '&#x60;';
            case '"':
                return '&quot;';
            case '<': 
                return '&lt;';
            case '>': 
                return '&gt;';
            default:
                return match
        }
    });
}

interface TimeLineProps {
    store?: MyStoreType
}

@inject('store')
@observer
export default class TimeLine extends React.Component<TimeLineProps> {
    render() {
        const {store} = this.props;
        const child = store!.timeLine.reverse().map(e => {
            const dt = new Date(e.date);
            const name = store!.findAuthorname(e.authorId);
            return <li key={e.id} css={{borderBottom:'solid 1px #ddd', padding:'6px'}}>
                <div css={{display:'flex', alignItems:'center'}}>
                    <img src={store!.findAuthorIcon(e.authorId)} width="24" height="24" css={{
                        borderRadius:'20px', border:'solid 1px gray', margin: '4px'}}  />
                    <span css={{margin:'0px 4px'}}>{name !== 'no_name' ? name : e.author}</span>
                    <span css={{color:'#999', fontSize:'13px', margin:'0px 4px'}}>
                        {dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate() + ' ' + dt.getHours() + ':' + dt.getMinutes()}
                    </span>
                </div>
                <div css={{marginLeft:'22px', padding:'6px'}}>
                    <span dangerouslySetInnerHTML={{__html: escape_html(e.say).replace('\n', '<br/>')}}></span>
                </div>
                <div css={{display:'flex', justifyContent:'space-around', fontSize:'11px', color:'#999'}}>
                    <span>reply:</span>
                    <span>favorite:</span>
                </div>
            </li>
        });
        return <ul css={{listStyleType:'none', padding:'0px'}}>{child}</ul>
    }
}