// @flow

import type { ThreadInfo } from '../types/thread-types';

function useInlineEngagementText(threadInfo: ?ThreadInfo): string {
  if (!threadInfo) {
    return '';
  }
  const repliesCount = threadInfo.repliesCount || 1;
  return String(repliesCount);
}

export default useInlineEngagementText;