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
            return <li key={e.id} css={{borderBottom:'solid 1px #ddd', padding:'6px'}}>
                <div css={{display:'flex', alignItems:'center'}}>
                    <img src={store!.findAuthorIcon(e.authorId)} width="24" height="24" css={{
                        borderRadius:'20px', border:'solid 1px gray', margin: '4px'}}  />
                    <span>{e.author}</span>
                </div>
                <div css={{padding:'2px'}}>
                    <span dangerouslySetInnerHTML={{__html: escape_html(e.say).replace('\n', '<br/>')}}></span>
                </div>
            </li>
        });
        return <ul css={{listStyleType:'none'}}>{child}</ul>
    }
}