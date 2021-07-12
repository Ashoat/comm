// @flow

import * as React from 'react';
import { View, Text, ScrollView } from 'react-native';

import type { ThreadInfo, ThreadType } from 'lib/types/thread-types';

import Button from '../components/button.react';
import CommunityPill from '../components/community-pill.react';
import ThreadVisibility from '../components/thread-visibility.react';
import { useColors, useStyles } from '../themes/colors';
import { useNavigateToThread } from './message-list-types';

type Props = {|
  +parentThreadInfo: ThreadInfo,
  +childThreadType: ThreadType,
|};
function ParentThreadHeader(props: Props): React.Node {
  const colors = useColors();
  const threadVisibilityColor = colors.modalForegroundLabel;
  const styles = useStyles(unboundStyles);

  const { parentThreadInfo, childThreadType } = props;

  const navigateToThread = useNavigateToThread();
  const onPressParentThread = React.useCallback(() => {
    navigateToThread({ threadInfo: parentThreadInfo });
  }, [parentThreadInfo, navigateToThread]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsHorizontalScrollIndicator={false}
        horizontal={true}
      >
        <ThreadVisibility
          threadType={childThreadType}
          color={threadVisibilityColor}
        />
        <Text style={styles.within}>within</Text>
        <Button onPress={onPressParentThread}>
          <CommunityPill community={parentThreadInfo} />
        </Button>
      </ScrollView>
    </View>
  );
}

const height = 48;
const unboundStyles = {
  container: {
    height,
    backgroundColor: 'panelForeground',
    borderBottomWidth: 1,
    borderBottomColor: 'panelForegroundBorder',
  },
  contentContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  within: {
    color: 'modalSubtextLabel',
    fontSize: 16,
    paddingHorizontal: 6,
  },
};

export default ParentThreadHeader;
