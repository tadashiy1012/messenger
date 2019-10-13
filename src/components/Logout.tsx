/** @jsx jsx */
import * as React from 'react';
import {css, jsx} from '@emotion/core';
import { UserStoreType } from '../types';

interface LogoutProps {
    user?: UserStoreType
}

export default function Logout({user}: LogoutProps) {
    const logoutClickHandler = () => {
        user!.logout().catch((err) => console.error(err));
    }
    return <button className="pure-button" onClick={() => {logoutClickHandler()}}>
        logout
    </button>
}