// @flow

import type { ViewStyle, TextStyle } from '../types/styles';
import type {
  DispatchFunctions,
  ActionFunc,
  BoundServerCall,
} from 'lib/utils/action-utils';

import * as React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  ViewPropTypes,
} from 'react-native';
import PropTypes from 'prop-types';

export type TooltipEntry<CustomProps> = {|
  id: string,
  text: string,
  onPress: (
    props: CustomProps,
    dispatchFunctions: DispatchFunctions,
    bindServerCall: (serverCall: ActionFunc) => BoundServerCall,
  ) => mixed,
|};

type Props<CustomProps: {}> = {
  spec: TooltipEntry<CustomProps>,
  onPress: (entry: TooltipEntry<CustomProps>) => void,
  containerStyle?: ViewStyle,
  labelStyle?: TextStyle,
};
class TooltipItem<CP: {}> extends React.PureComponent<Props<CP>> {
  static propTypes = {
    spec: PropTypes.shape({
      text: PropTypes.string.isRequired,
      onPress: PropTypes.func.isRequired,
    }).isRequired,
    onPress: PropTypes.func.isRequired,
    containerStyle: ViewPropTypes.style,
    labelStyle: Text.propTypes.style,
  };

  render() {
    return (
      <View style={[styles.itemContainer, this.props.containerStyle]}>
        <TouchableOpacity onPress={this.onPress}>
          <Text style={[styles.label, this.props.labelStyle]} numberOfLines={1}>
            {this.props.spec.text}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  onPress = () => {
    this.props.onPress(this.props.spec);
  };
}

const styles = StyleSheet.create({
  itemContainer: {
    padding: 10,
  },
  label: {
    color: '#444',
    fontSize: 14,
    lineHeight: 17,
    textAlign: 'center',
  },
});

export default TooltipItem;
