// @flow

import * as React from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  Text,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { isLoggedIn } from 'lib/selectors/user-selectors';

import { useSelector } from '../redux/redux-utils';
import { useStyles, useColors } from '../themes/colors';
import type { ViewStyle } from '../types/styles';

type Props = {|
  ...React.ElementConfig<typeof TextInput>,
  +searchText: string,
  +onChangeText: (searchText: string) => mixed,
  +containerStyle?: ViewStyle,
  +active?: boolean,
|};
const Search = React.forwardRef<Props, typeof TextInput>(
  function ForwardedSearch(props: Props, ref: React.Ref<typeof TextInput>) {
    const { onChangeText, searchText, containerStyle, active, ...rest } = props;

    const clearSearch = React.useCallback(() => {
      onChangeText('');
    }, [onChangeText]);

    const loggedIn = useSelector(isLoggedIn);
    const styles = useStyles(unboundStyles);
    const colors = useColors();
    const prevLoggedInRef = React.useRef();
    React.useEffect(() => {
      const prevLoggedIn = prevLoggedInRef.current;
      prevLoggedInRef.current = loggedIn;
      if (!loggedIn && prevLoggedIn) {
        clearSearch();
      }
    }, [loggedIn, clearSearch]);

    const { listSearchIcon: iconColor } = colors;

    let clearSearchInputIcon = null;
    if (searchText) {
      clearSearchInputIcon = (
        <TouchableOpacity
          onPress={clearSearch}
          activeOpacity={0.5}
          style={styles.clearSearchButton}
        >
          <Icon name="times-circle" size={18} color={iconColor} />
        </TouchableOpacity>
      );
    }

    const inactive = active === false;
    const usingPlaceholder = !searchText && rest.placeholder;
    const inactiveTextStyle = React.useMemo(
      () =>
        inactive && usingPlaceholder
          ? [styles.searchText, styles.inactiveSearchText, { color: iconColor }]
          : [styles.searchText, styles.inactiveSearchText],
      [
        inactive,
        usingPlaceholder,
        styles.searchText,
        styles.inactiveSearchText,
        iconColor,
      ],
    );

    let textNode;
    if (!inactive) {
      const textInputProps: React.ElementProps<typeof TextInput> = {
        style: styles.searchText,
        value: searchText,
        onChangeText: onChangeText,
        placeholderTextColor: iconColor,
        returnKeyType: 'go',
      };
      textNode = <TextInput {...textInputProps} {...rest} ref={ref} />;
    } else {
      const text = usingPlaceholder ? rest.placeholder : searchText;
      textNode = <Text style={inactiveTextStyle}>{text}</Text>;
    }

    return (
      <View style={[styles.search, containerStyle]}>
        <Icon name="search" size={18} color={iconColor} />
        {textNode}
        {clearSearchInputIcon}
      </View>
    );
  },
);

const unboundStyles = {
  search: {
    alignItems: 'center',
    backgroundColor: 'listSearchBackground',
    borderRadius: 6,
    flexDirection: 'row',
    paddingLeft: 14,
    paddingRight: 7,
  },
  inactiveSearchText: {
    transform: Platform.select({
      ios: [{ translateY: 1 / 3 }],
      default: undefined,
    }),
  },
  searchText: {
    color: 'listForegroundLabel',
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    marginVertical: 6,
    padding: 0,
    borderBottomColor: 'transparent',
  },
  clearSearchButton: {
    padding: 5,
  },
};

export default React.memo<Props>(Search);
