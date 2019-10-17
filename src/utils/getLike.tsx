/** @jsx jsx */
import * as React from 'react';
import { css, jsx } from '@emotion/core';
import { UserType, SayType, UserStoreType } from '../types';

const getAlike = (user:UserType, say:SayType, userStore:UserStoreType) => {
    const likeClickHandler = (tgt: SayType) => {
        userStore.updateUserLike(tgt).catch(err => console.error(err));
    }
    const unLikeClickHandler = (tgt: SayType) => {
        userStore.updateUserUnLike(tgt).catch(err => console.error(err));
    }
    return user && say.like.find(ee => ee === user.serial) ? 
        <i className="material-icons" css={{cursor:'pointer'}} onClick={() => {
            unLikeClickHandler(say)}}>favorite</i> :
        <i className="material-icons" css={{cursor:'pointer'}} onClick={() => {
            likeClickHandler(say)}}>favorite_border</i>;
};
const getNALike = (user:UserType, say:SayType) => {
    return user && say.like.find(ee => ee === user!.serial) ? 
        <i className="material-icons">favorite</i> :
        <i className="material-icons">favorite_border</i>;
};

export {getAlike, getNALike};