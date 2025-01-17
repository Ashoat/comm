// @flow

import {
  createOrUpdatePublicLinkActionTypes,
  disableInviteLinkLinkActionTypes,
  fetchPrimaryInviteLinkActionTypes,
} from '../actions/link-actions.js';
import {
  deleteAccountActionTypes,
  logOutActionTypes,
} from '../actions/user-actions.js';
import type { InviteLinksStore } from '../types/link-types.js';
import type { BaseAction } from '../types/redux-types.js';
import { setNewSessionActionType } from '../utils/action-utils.js';

function reduceInviteLinks(
  state: InviteLinksStore,
  action: BaseAction,
): InviteLinksStore {
  if (action.type === fetchPrimaryInviteLinkActionTypes.success) {
    const links = {};
    for (const link of action.payload.links) {
      links[link.communityID] = {
        ...state.links[link.communityID],
        primaryLink: link,
      };
    }
    return {
      links,
    };
  } else if (action.type === createOrUpdatePublicLinkActionTypes.success) {
    const communityID = action.payload.communityID;
    return {
      ...state,
      links: {
        ...state.links,
        [communityID]: {
          ...state.links[communityID],
          primaryLink: action.payload,
        },
      },
    };
  } else if (action.type === disableInviteLinkLinkActionTypes.success) {
    const communityID = action.payload.communityID;
    const currentPrimaryLink = state.links[communityID]?.primaryLink;
    if (currentPrimaryLink?.name !== action.payload.name) {
      return state;
    }

    const communityLinks = {
      ...state.links[communityID],
      primaryLink: null,
    };
    return {
      ...state,
      links: {
        ...state.links,
        [communityID]: communityLinks,
      },
    };
  } else if (
    action.type === logOutActionTypes.success ||
    action.type === deleteAccountActionTypes.success ||
    (action.type === setNewSessionActionType &&
      action.payload.sessionChange.cookieInvalidated)
  ) {
    return {
      links: {},
    };
  }
  return state;
}

export default reduceInviteLinks;
