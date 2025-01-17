// @flow

import { createSelector } from 'reselect';

import {
  cookieSelector,
  sessionIDSelector,
  urlPrefixSelector,
  connectionSelector,
  lastCommunicatedPlatformDetailsSelector,
} from './keyserver-selectors.js';
import type { PlatformDetails } from '../types/device-types.js';
import type { AppState } from '../types/redux-types.js';
import type {
  ConnectionInfo,
  ConnectionStatus,
} from '../types/socket-types.js';
import { type CurrentUserInfo } from '../types/user-types.js';

export type ServerCallState = {
  +cookie: ?string,
  +urlPrefix: ?string,
  +sessionID: ?string,
  +currentUserInfo: ?CurrentUserInfo,
  +connectionStatus: ?ConnectionStatus,
  +lastCommunicatedPlatformDetails: ?PlatformDetails,
};

const serverCallStateSelector: (state: AppState) => ServerCallState =
  createSelector(
    cookieSelector,
    urlPrefixSelector,
    sessionIDSelector,
    (state: AppState) => state.currentUserInfo,
    connectionSelector,
    lastCommunicatedPlatformDetailsSelector,
    (
      cookie: ?string,
      urlPrefix: ?string,
      sessionID: ?string,
      currentUserInfo: ?CurrentUserInfo,
      connectionInfo: ?ConnectionInfo,
      lastCommunicatedPlatformDetails: ?PlatformDetails,
    ) => ({
      cookie,
      urlPrefix,
      sessionID,
      currentUserInfo,
      connectionStatus: connectionInfo?.status,
      lastCommunicatedPlatformDetails,
    }),
  );

export { serverCallStateSelector };
