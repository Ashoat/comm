// @flow

import * as React from 'react';
import { View, Text } from 'react-native';
import Icon, {
  type FontAwesome5Glyphs,
} from 'react-native-vector-icons/FontAwesome5';
import tinycolor from 'tinycolor2';

import { useStyles } from '../themes/colors';

type Props = {|
  +label: string,
  +backgroundColor: string,
  +faIcon?: FontAwesome5Glyphs,
  +roundCorners?: {| +left: boolean, +right: boolean |},
|};
function Pill(props: Props): React.Node {
  const styles = useStyles(unboundStyles);

  const roundLeft = props.roundCorners?.left ?? true;
  const roundRight = props.roundCorners?.right ?? true;

  const variableContainerStyles = React.useMemo(() => {
    return {
      backgroundColor: props.backgroundColor,
      borderBottomLeftRadius: roundLeft ? 8 : 0,
      borderTopLeftRadius: roundLeft ? 8 : 0,
      borderTopRightRadius: roundRight ? 8 : 0,
      borderBottomRightRadius: roundRight ? 8 : 0,
    };
  }, [props.backgroundColor, roundLeft, roundRight]);

  const combinedContainerStyles = React.useMemo(
    () => [styles.container, variableContainerStyles],
    [styles.container, variableContainerStyles],
  );

  const textColor = React.useMemo(
    () => (tinycolor(props.backgroundColor).isDark() ? 'white' : 'black'),
    [props.backgroundColor],
  );

  const combinedTextStyles = React.useMemo(
    () => [styles.label, { color: textColor }],
    [styles.label, textColor],
  );

  const icon = React.useMemo(() => {
    if (props.faIcon) {
      return (
        <Icon
          name={props.faIcon}
          size={12}
          color={textColor}
          style={styles.icon}
        />
      );
    }
  }, [props.faIcon, styles.icon, textColor]);

  return (
    <View style={combinedContainerStyles}>
      {icon}
      <Text style={combinedTextStyles}>{props.label}</Text>
    </View>
  );
}

const unboundStyles = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  icon: {
    paddingRight: 8,
  },
};

export default Pill;
