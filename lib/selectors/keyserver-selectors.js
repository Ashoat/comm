// @flow

import { createSelector } from 'reselect';

import type { PlatformDetails } from '../types/device-types';
import type { KeyserverInfo } from '../types/keyserver-types';
import type { AppState } from '../types/redux-types.js';
import type { ConnectionInfo } from '../types/socket-types.js';
import { ashoatKeyserverID } from '../utils/validation-utils.js';

const cookieSelector: (state: AppState) => ?string = (state: AppState) =>
  state.keyserverStore.keyserverInfos[ashoatKeyserverID]?.cookie;

const cookiesSelector: (state: AppState) => {
  +[keyserverID: string]: string,
} = createSelector(
  (state: AppState) => state.keyserverStore.keyserverInfos,
  (infos: { +[key: string]: KeyserverInfo }) => {
    const cookies = {};
    for (const keyserverID in infos) {
      cookies[keyserverID] = infos[keyserverID].cookie;
    }
    return cookies;
  },
);

const sessionIDSelector: (state: AppState) => ?string = (state: AppState) =>
  state.keyserverStore.keyserverInfos[ashoatKeyserverID]?.sessionID;

const updatesCurrentAsOfSelector: (state: AppState) => number = (
  state: AppState,
) =>
  state.keyserverStore.keyserverInfos[ashoatKeyserverID]?.updatesCurrentAsOf ??
  0;

const currentAsOfSelector: (state: AppState) => number = (state: AppState) =>
  state.messageStore.currentAsOf[ashoatKeyserverID] ?? 0;

const urlPrefixSelector: (state: AppState) => ?string = (state: AppState) =>
  state.keyserverStore.keyserverInfos[ashoatKeyserverID]?.urlPrefix;

const connectionSelector: (state: AppState) => ?ConnectionInfo = (
  state: AppState,
) => state.keyserverStore.keyserverInfos[ashoatKeyserverID]?.connection;

const lastCommunicatedPlatformDetailsSelector: (
  state: AppState,
) => ?PlatformDetails = (state: AppState) =>
  state.keyserverStore.keyserverInfos[ashoatKeyserverID]
    ?.lastCommunicatedPlatformDetails;

export {
  cookieSelector,
  cookiesSelector,
  sessionIDSelector,
  updatesCurrentAsOfSelector,
  currentAsOfSelector,
  urlPrefixSelector,
  connectionSelector,
  lastCommunicatedPlatformDetailsSelector,
};
