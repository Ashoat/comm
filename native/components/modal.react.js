// @flow

import { useNavigation } from '@react-navigation/native';
import * as React from 'react';
import { View, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Edge } from 'react-native-safe-area-context';

import { useStyles } from '../themes/colors';
import type { ViewStyle } from '../types/styles';
import KeyboardAvoidingView from './keyboard-avoiding-view.react';

type Props = $ReadOnly<{|
  +children: React.Node,
  +containerStyle?: ViewStyle,
  +modalStyle?: ViewStyle,
  +safeAreaEdges?: $ReadOnlyArray<Edge>,
|}>;
function Modal(props: Props) {
  const navigation = useNavigation();
  const close = React.useCallback(() => {
    if (navigation.isFocused()) {
      navigation.goBack();
    }
  }, [navigation]);

  const styles = useStyles(unboundStyles);
  const { containerStyle, modalStyle, children, safeAreaEdges } = props;
  return (
    <SafeAreaView style={styles.container} edges={safeAreaEdges}>
      <KeyboardAvoidingView
        behavior="padding"
        style={[styles.container, containerStyle]}
      >
        <TouchableWithoutFeedback onPress={close}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
        <View style={[styles.modal, modalStyle]}>{children}</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const unboundStyles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    overflow: 'visible',
  },
  modal: {
    backgroundColor: 'modalBackground',
    borderRadius: 5,
    flex: 1,
    justifyContent: 'center',
    marginBottom: 30,
    marginHorizontal: 15,
    marginTop: 100,
    padding: 12,
  },
};

export default Modal;
