// @flow

import type { TextStyle, Styles } from '../types/styles';
import { type UserListItem, userListItemPropType } from 'lib/types/user-types';
import type { AppState } from '../redux/redux-setup';

import * as React from 'react';
import PropTypes from 'prop-types';
import { Text, Platform } from 'react-native';

import { connect } from 'lib/utils/redux-utils';

import Button from './button.react';
import {
  type Colors,
  colorsPropType,
  colorsSelector,
  styleSelector,
} from '../themes/colors';

// eslint-disable-next-line no-unused-vars
const getUserListItemHeight = (item: UserListItem) => {
  // TODO consider parent thread notice
  return Platform.OS === 'ios' ? 31.5 : 33.5;
};

type Props = {|
  userInfo: UserListItem,
  onSelect: (userID: string) => void,
  textStyle?: TextStyle,
  // Redux state
  colors: Colors,
  styles: Styles,
|};
class UserListUser extends React.PureComponent<Props> {
  static propTypes = {
    userInfo: userListItemPropType.isRequired,
    onSelect: PropTypes.func.isRequired,
    textStyle: Text.propTypes.style,
    colors: colorsPropType.isRequired,
    styles: PropTypes.objectOf(PropTypes.object).isRequired,
  };

  render() {
    let parentThreadNotice = null;
    if (!this.props.userInfo.memberOfParentThread) {
      parentThreadNotice = (
        <Text style={this.props.styles.parentThreadNotice}>
          not in parent thread
        </Text>
      );
    }
    const { modalIosHighlightUnderlay: underlayColor } = this.props.colors;
    return (
      <Button
        onPress={this.onSelect}
        iosFormat="highlight"
        iosHighlightUnderlayColor={underlayColor}
        iosActiveOpacity={0.85}
        style={this.props.styles.button}
      >
        <Text
          style={[this.props.styles.text, this.props.textStyle]}
          numberOfLines={1}
        >
          {this.props.userInfo.username}
        </Text>
        {parentThreadNotice}
      </Button>
    );
  }

  onSelect = () => {
    this.props.onSelect(this.props.userInfo.id);
  };
}

const styles = {
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    flex: 1,
    color: 'modalForegroundLabel',
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 16,
  },
  parentThreadNotice: {
    color: 'modalForegroundSecondaryLabel',
    fontStyle: 'italic',
  },
};
const stylesSelector = styleSelector(styles);

const WrappedUserListUser = connect((state: AppState) => ({
  colors: colorsSelector(state),
  styles: stylesSelector(state),
}))(UserListUser);

export { WrappedUserListUser as UserListUser, getUserListItemHeight };
