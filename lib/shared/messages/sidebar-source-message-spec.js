// @flow

import invariant from 'invariant';

import type {
  RawSidebarSourceMessageInfo,
  SidebarSourceMessageData,
  SidebarSourceMessageInfo,
} from '../../types/message-types';
import { messageTypes } from '../../types/message-types';
import { hasMinCodeVersion } from '../version-utils';
import type { MessageSpec } from './message-spec';
import { assertSingleMessageInfo } from './utils';

export const sidebarSourceMessageSpec: MessageSpec<
  SidebarSourceMessageData,
  RawSidebarSourceMessageInfo,
  SidebarSourceMessageInfo,
> = Object.freeze({
  messageContent(data) {
    const sourceMessageID = data.sourceMessage?.id;
    invariant(sourceMessageID, 'Source message id should be set');
    return JSON.stringify({
      sourceMessageID,
    });
  },

  rawMessageInfoFromRow(row, params) {
    const { derivedMessages } = params;
    invariant(derivedMessages, 'Derived messages should be provided');

    const content = JSON.parse(row.content);
    const sourceMessage = derivedMessages.get(content.sourceMessageID);
    if (!sourceMessage) {
      console.warn(
        `Message with id ${row.id} has a derived message ` +
          `${content.sourceMessageID} which is not present in the database`,
      );
    }
    return {
      type: messageTypes.SIDEBAR_SOURCE,
      id: row.id.toString(),
      threadID: row.threadID.toString(),
      time: row.time,
      creatorID: row.creatorID.toString(),
      sourceMessage,
    };
  },

  createMessageInfo(rawMessageInfo, creator, params) {
    if (!rawMessageInfo.sourceMessage) {
      return null;
    }
    const sourceMessage = params.createMessageInfoFromRaw(
      rawMessageInfo.sourceMessage,
    );
    invariant(
      sourceMessage && sourceMessage.type !== messageTypes.SIDEBAR_SOURCE,
      'Sidebars can not be created from SIDEBAR SOURCE',
    );

    return {
      type: messageTypes.SIDEBAR_SOURCE,
      id: rawMessageInfo.id,
      threadID: rawMessageInfo.threadID,
      creator,
      time: rawMessageInfo.time,
      sourceMessage,
    };
  },

  rawMessageInfoFromMessageData(messageData, id) {
    return { ...messageData, id };
  },

  shimUnsupportedMessageInfo(rawMessageInfo, platformDetails) {
    // TODO determine min code version
    if (
      hasMinCodeVersion(platformDetails, 75) &&
      rawMessageInfo.sourceMessage
    ) {
      return rawMessageInfo;
    }
    const { id } = rawMessageInfo;
    invariant(id !== null && id !== undefined, 'id should be set on server');
    return {
      type: messageTypes.UNSUPPORTED,
      id,
      threadID: rawMessageInfo.threadID,
      creatorID: rawMessageInfo.creatorID,
      time: rawMessageInfo.time,
      robotext: 'first message in sidebar',
      dontPrefixCreator: true,
      unsupportedMessageInfo: rawMessageInfo,
    };
  },

  unshimMessageInfo(unwrapped) {
    return unwrapped;
  },

  notificationTexts(messageInfos, threadInfo, params) {
    const messageInfo = assertSingleMessageInfo(messageInfos);
    invariant(
      messageInfo.type === messageTypes.SIDEBAR_SOURCE,
      'messageInfo should be messageTypes.SIDEBAR_SOURCE!',
    );
    const sourceMessageInfo = messageInfo.sourceMessage;
    return params.notificationTexts([sourceMessageInfo], threadInfo);
  },

  generatesNotifs: false,

  startsThread: true,
});
