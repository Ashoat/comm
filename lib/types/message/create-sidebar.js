// @flow

import type { ThreadInfo } from '../thread-types';
import type { RelativeUserInfo } from '../user-types';

export type CreateSidebarMessageData = {|
  +type: 18,
  +threadID: string,
  +creatorID: string,
  +time: number,
  +initialThreadState: {|
    +name: ?string,
    +parentThreadID: string,
    +color: string,
    +memberIDs: string[],
  |},
|};

export type RawCreateSidebarMessageInfo = {|
  ...CreateSidebarMessageData,
  id: string,
|};

export type CreateSidebarMessageInfo = {|
  +type: 18,
  +id: string,
  +threadID: string,
  +creator: RelativeUserInfo,
  +time: number,
  +initialThreadState: {|
    +name: ?string,
    +parentThreadInfo: ThreadInfo,
    +color: string,
    +otherMembers: RelativeUserInfo[],
  |},
|};
