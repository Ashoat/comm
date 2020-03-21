// @flow

import type { ViewStyle } from '../types/styles';

import * as React from 'react';
import {
  Platform,
  View,
  TouchableNativeFeedback,
  TouchableHighlight,
  ViewPropTypes,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import invariant from 'invariant';

const ANDROID_VERSION_LOLLIPOP = 21;

type Props = {
  onPress: () => *,
  disabled?: boolean,
  style?: ViewStyle,
  // style and topStyle just get merged in most cases. The separation only
  // matters in the case of iOS and iosFormat = "highlight", where the
  // topStyle is necessary for layout, and the bottom style is necessary for
  // colors etc.
  topStyle?: ViewStyle,
  children?: React.Node,
  androidBorderlessRipple: boolean,
  iosFormat: 'highlight' | 'opacity',
  androidFormat: 'ripple' | 'highlight' | 'opacity',
  iosHighlightUnderlayColor?: string,
  iosActiveOpacity: number,
};
class Button extends React.PureComponent<Props> {
  static propTypes = {
    onPress: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    style: ViewPropTypes.style,
    topStyle: ViewPropTypes.style,
    children: PropTypes.node,
    androidBorderlessRipple: PropTypes.bool,
    iosFormat: PropTypes.oneOf(['highlight', 'opacity']),
    androidFormat: PropTypes.oneOf(['ripple', 'highlight', 'opacity']),
    iosHighlightUnderlayColor: PropTypes.string,
    iosActiveOpacity: PropTypes.number,
  };
  static defaultProps = {
    androidBorderlessRipple: false,
    iosFormat: 'opacity',
    androidFormat: 'ripple',
    iosActiveOpacity: 0.2,
  };

  render() {
    if (
      Platform.OS === 'android' &&
      this.props.androidFormat === 'ripple' &&
      Platform.Version >= ANDROID_VERSION_LOLLIPOP
    ) {
      return (
        <TouchableNativeFeedback
          onPress={this.props.onPress}
          disabled={!!this.props.disabled}
          background={TouchableNativeFeedback.Ripple(
            'rgba(0, 0, 0, .32)',
            this.props.androidBorderlessRipple,
          )}
        >
          <View style={[this.props.topStyle, this.props.style]}>
            {this.props.children}
          </View>
        </TouchableNativeFeedback>
      );
    }
    let format = 'opacity';
    if (Platform.OS === 'ios') {
      format = this.props.iosFormat;
    } else if (
      Platform.OS === 'android' &&
      this.props.androidFormat !== 'ripple'
    ) {
      format = this.props.androidFormat;
    }
    if (format === 'highlight') {
      const underlayColor = this.props.iosHighlightUnderlayColor;
      invariant(
        underlayColor,
        'iosHighlightUnderlayColor should be specified to Button in ' +
          "format='highlight'",
      );
      return (
        <TouchableHighlight
          onPress={this.props.onPress}
          style={this.props.topStyle}
          underlayColor={underlayColor}
          activeOpacity={this.props.iosActiveOpacity}
          disabled={!!this.props.disabled}
        >
          <View style={this.props.style}>{this.props.children}</View>
        </TouchableHighlight>
      );
    } else {
      return (
        <TouchableOpacity
          onPress={this.props.onPress}
          style={[this.props.topStyle, this.props.style]}
          activeOpacity={this.props.iosActiveOpacity}
          disabled={!!this.props.disabled}
        >
          {this.props.children}
        </TouchableOpacity>
      );
    }
  }
}

export default Button;
