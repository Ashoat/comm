// @flow

import type { GlobalTheme } from '../types/themes';

import * as React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

type Props = {|
  title: ?string,
  message: string,
  activeTheme: ?GlobalTheme,
|};
function InAppNotif(props: Props) {
  const useLightStyle = Platform.OS === 'ios' && props.activeTheme !== 'dark';

  let title = null;
  if (props.title) {
    const titleStyles = [
      styles.title,
      useLightStyle ? styles.lightTitle : null,
    ];
    title = (
      <Text style={titleStyles} numberOfLines={1}>
        {props.title}
        {'\n'}
      </Text>
    );
  }

  const textStyles = [styles.text, useLightStyle ? styles.lightText : null];
  return (
    <View style={styles.notif}>
      <Text style={textStyles}>
        {title}
        {props.message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  lightText: {
    color: 'white',
  },
  lightTitle: {
    color: 'white',
  },
  notif: {
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
    textAlign: 'left',
    width: '100%',
  },
  text: {
    ...Platform.select({
      ios: {
        fontSize: 16,
        marginTop: 16,
        marginBottom: 6,
        color: 'black',
      },
      default: {
        fontSize: 18,
        marginVertical: 16,
      },
    }),
    marginHorizontal: 10,
  },
  title: {
    color: 'black',
    fontWeight: 'bold',
  },
});

export default InAppNotif;
