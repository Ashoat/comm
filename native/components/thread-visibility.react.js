// @flow

import * as React from 'react';
import { View, StyleSheet } from 'react-native';

import { threadLabel } from 'lib/shared/thread-utils';
import type { ThreadType } from 'lib/types/thread-types';

import Pill from './pill.react';
import ThreadIcon from './thread-icon.react';

type Props = {|
  +threadType: ThreadType,
  +color: string,
|};
function ThreadVisibility(props: Props) {
  const { threadType, color } = props;
  const label = threadLabel(threadType);
  const icon = React.useMemo(
    () => <ThreadIcon threadType={threadType} color="white" />,
    [threadType],
  );

  return (
    <View style={styles.container}>
      <Pill icon={icon} label={label} backgroundColor={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});

export default ThreadVisibility;
