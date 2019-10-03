/** @jsx jsx */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { observer, inject } from 'mobx-react';
import { css, jsx } from '@emotion/core';
import { MyStoreType } from '../types';
import Setting from './Setting';
import Writer from './Writer';
import TimeLine from './Timeline';
import { ShowMode } from '../enums';
import User from './User';
import FollowListContainer from './FollowList';

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
        let child = null;
        if (store!.showMode === ShowMode.MAIN || store!.showMode === ShowMode.MESSAGE) {
            child = <Main logged={store!.logged} />;
        } else if (store!.showMode === ShowMode.USER) {
            child = <User />;
        } else if (store!.showMode === ShowMode.SETTING) {
            child = <Set />;
        } else if (store!.showMode === ShowMode.FOLLOW) {
            child = <FollowListContainer />;
        } else {
            child = <Main logged={store!.logged} />;
        }
        return <React.Fragment>
            {child}
        </React.Fragment>
    }
}