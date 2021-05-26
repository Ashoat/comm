// @flow

import type { StaleNavigationState } from '@react-navigation/native';

import type { BaseNavInfo } from 'lib/types/nav-types';
import { fifteenDaysEarlier, fifteenDaysLater } from 'lib/utils/date-utils';

import {
  AppRouteName,
  TabNavigatorRouteName,
  LoggedOutModalRouteName,
  ProfileRouteName,
  ProfileScreenRouteName,
  ChatRouteName,
  ChatThreadListRouteName,
  HomeChatThreadListRouteName,
  BackgroundChatThreadListRouteName,
  AppsRouteName,
} from './route-names';

export type NavInfo = $Exact<BaseNavInfo>;

const defaultNavigationState: StaleNavigationState = {
  type: 'stack',
  index: 1,
  routes: [
    {
      name: AppRouteName,
      state: {
        type: 'stack',
        index: 0,
        routes: [
          {
            name: TabNavigatorRouteName,
            state: {
              type: 'tab',
              index: 0,
              routes: [
                {
                  name: ChatRouteName,
                  state: {
                    type: 'stack',
                    index: 0,
                    routes: [
                      {
                        name: ChatThreadListRouteName,
                        state: {
                          type: 'tab',
                          index: 0,
                          routes: [
                            { name: HomeChatThreadListRouteName },
                            { name: BackgroundChatThreadListRouteName },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  name: ProfileRouteName,
                  state: {
                    type: 'stack',
                    index: 0,
                    routes: [{ name: ProfileScreenRouteName }],
                  },
                },
                { name: AppsRouteName },
              ],
            },
          },
        ],
      },
    },
    { name: LoggedOutModalRouteName },
  ],
};

const defaultNavInfo: NavInfo = {
  startDate: fifteenDaysEarlier().valueOf(),
  endDate: fifteenDaysLater().valueOf(),
};

export { defaultNavigationState, defaultNavInfo };
