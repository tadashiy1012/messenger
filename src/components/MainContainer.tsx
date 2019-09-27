/** @jsx jsx */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observer, inject } from 'mobx-react';
import { css, jsx } from '@emotion/core';
import { MyStoreType, } from '../store';
import Setting from './Setting';
import Writer from './Writer';
import TimeLine from './Timeline';

const Main = (props: {logged: Boolean}) => {
    const writer = props.logged ? <Writer /> : null;
    return (
        <React.Fragment>
            <h2 css={{marginBottom:'2px'}}>main</h2>
            {writer}
            <TimeLine />
        </React.Fragment>
    );
};

const Set = () => (
    <React.Fragment>
        <h2 css={{marginBottom:'2px'}}>setting</h2>
        <Setting />
    </React.Fragment>
);

interface MainContainerProps {
    store?: MyStoreType
}

@inject('store')
@observer
export default class MainContainer extends React.Component<MainContainerProps> {
    render() {
        const {store} = this.props;
        const child = store!.showSetting ? <Set /> : <Main logged={store!.logged} />
        return <React.Fragment>
            {child}
        </React.Fragment>
    }
}