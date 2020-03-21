// @flow

import type { InnerLogInPanel, LogInState } from './log-in-panel.react';
import {
  type StateContainer,
  stateContainerPropType,
} from '../utils/state-container';
import type { AppState } from '../redux/redux-setup';
import { type Dimensions, dimensionsPropType } from 'lib/types/media-types';

import * as React from 'react';
import { View, Animated, Text, Easing, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import invariant from 'invariant';
import PropTypes from 'prop-types';

import sleep from 'lib/utils/sleep';
import { connect } from 'lib/utils/redux-utils';

import { dimensionsSelector } from '../selectors/dimension-selectors';
import LogInPanel from './log-in-panel.react';
import ForgotPasswordPanel from './forgot-password-panel.react';

type LogInMode = 'log-in' | 'forgot-password' | 'forgot-password-success';

type Props = {|
  onePasswordSupported: boolean,
  setActiveAlert: (activeAlert: boolean) => void,
  opacityValue: Animated.Value,
  forgotPasswordLinkOpacity: Animated.Value,
  logInState: StateContainer<LogInState>,
  innerRef: (container: ?LogInPanelContainer) => void,
  // Redux state
  dimensions: Dimensions,
|};
type State = {|
  panelTransition: Animated.Value,
  logInMode: LogInMode,
  nextLogInMode: LogInMode,
|};
class LogInPanelContainer extends React.PureComponent<Props, State> {
  static propTypes = {
    onePasswordSupported: PropTypes.bool.isRequired,
    setActiveAlert: PropTypes.func.isRequired,
    opacityValue: PropTypes.object.isRequired,
    forgotPasswordLinkOpacity: PropTypes.object.isRequired,
    logInState: stateContainerPropType.isRequired,
    innerRef: PropTypes.func.isRequired,
    dimensions: dimensionsPropType.isRequired,
  };
  state = {
    panelTransition: new Animated.Value(0),
    logInMode: 'log-in',
    nextLogInMode: 'log-in',
  };
  logInPanel: ?InnerLogInPanel = null;

  componentDidMount() {
    this.props.innerRef(this);
  }

  componentWillUnmount() {
    this.props.innerRef(null);
  }

  render() {
    const windowWidth = this.props.dimensions.width;
    const logInPanelDynamicStyle = {
      left: this.state.panelTransition.interpolate({
        inputRange: [0, 2],
        outputRange: [0, windowWidth * -2],
      }),
      right: this.state.panelTransition.interpolate({
        inputRange: [0, 2],
        outputRange: [0, windowWidth * 2],
      }),
    };
    const logInPanel = (
      <Animated.View style={[styles.panel, logInPanelDynamicStyle]}>
        <LogInPanel
          setActiveAlert={this.props.setActiveAlert}
          opacityValue={this.props.opacityValue}
          onePasswordSupported={this.props.onePasswordSupported}
          innerRef={this.logInPanelRef}
          state={this.props.logInState}
        />
      </Animated.View>
    );
    let forgotPasswordPanel = null;
    if (
      this.state.nextLogInMode !== 'log-in' ||
      this.state.logInMode !== 'log-in'
    ) {
      const forgotPasswordPanelDynamicStyle = {
        left: this.state.panelTransition.interpolate({
          inputRange: [0, 2],
          outputRange: [windowWidth, windowWidth * -1],
        }),
        right: this.state.panelTransition.interpolate({
          inputRange: [0, 2],
          outputRange: [windowWidth * -1, windowWidth],
        }),
      };
      forgotPasswordPanel = (
        <Animated.View style={[styles.panel, forgotPasswordPanelDynamicStyle]}>
          <ForgotPasswordPanel
            setActiveAlert={this.props.setActiveAlert}
            opacityValue={this.props.opacityValue}
            onSuccess={this.onForgotPasswordSuccess}
          />
        </Animated.View>
      );
    }
    let forgotPasswordSuccess = null;
    if (
      this.state.nextLogInMode === 'forgot-password-success' ||
      this.state.logInMode === 'forgot-password-success'
    ) {
      const forgotPasswordSuccessDynamicStyle = {
        left: this.state.panelTransition.interpolate({
          inputRange: [0, 2],
          outputRange: [windowWidth * 2, 0],
        }),
        right: this.state.panelTransition.interpolate({
          inputRange: [0, 2],
          outputRange: [windowWidth * -2, 0],
        }),
      };
      const successText =
        "Okay, we've sent that account an email. Check your inbox to " +
        'complete the process.';
      forgotPasswordSuccess = (
        <Animated.View
          style={[styles.panel, forgotPasswordSuccessDynamicStyle]}
        >
          <Icon
            name="check-circle"
            size={48}
            color="#88FF88DD"
            style={styles.forgotPasswordSuccessIcon}
          />
          <Text style={styles.forgotPasswordSuccessText}>{successText}</Text>
        </Animated.View>
      );
    }
    return (
      <View>
        {logInPanel}
        {forgotPasswordPanel}
        {forgotPasswordSuccess}
      </View>
    );
  }

  logInPanelRef = (logInPanel: ?InnerLogInPanel) => {
    this.logInPanel = logInPanel;
  };

  onPressForgotPassword = () => {
    this.setState({ nextLogInMode: 'forgot-password' });

    const duration = 350;
    const animations = [
      Animated.timing(this.props.forgotPasswordLinkOpacity, {
        duration,
        easing: Easing.out(Easing.ease),
        toValue: 0,
      }),
      Animated.timing(this.state.panelTransition, {
        duration,
        easing: Easing.out(Easing.ease),
        toValue: 1,
      }),
    ];

    let listenerID = '';
    const listener = (animatedUpdate: { value: number }) => {
      if (animatedUpdate.value === 1) {
        this.setState({ logInMode: this.state.nextLogInMode });
        this.state.panelTransition.removeListener(listenerID);
      }
    };
    listenerID = this.state.panelTransition.addListener(listener);

    Animated.parallel(animations).start();
  };

  backFromLogInMode = () => {
    if (this.state.nextLogInMode === 'log-in') {
      return false;
    }

    this.setState({
      logInMode: this.state.nextLogInMode,
      nextLogInMode: 'log-in',
    });
    invariant(this.logInPanel, 'ref should be set');
    this.logInPanel.focusUsernameOrEmailInput();

    const duration = 350;
    const animations = [
      Animated.timing(this.props.forgotPasswordLinkOpacity, {
        duration,
        easing: Easing.out(Easing.ease),
        toValue: 1,
      }),
      Animated.timing(this.state.panelTransition, {
        duration,
        easing: Easing.out(Easing.ease),
        toValue: 0,
      }),
    ];

    let listenerID = '';
    const listener = (animatedUpdate: { value: number }) => {
      if (animatedUpdate.value === 0) {
        this.setState({ logInMode: this.state.nextLogInMode });
        this.state.panelTransition.removeListener(listenerID);
      }
    };
    listenerID = this.state.panelTransition.addListener(listener);

    Animated.parallel(animations).start();
    return true;
  };

  onForgotPasswordSuccess = () => {
    if (this.state.nextLogInMode === 'log-in') {
      return;
    }

    this.setState({ nextLogInMode: 'forgot-password-success' });

    const duration = 350;

    let listenerID = '';
    const listener = (animatedUpdate: { value: number }) => {
      if (animatedUpdate.value === 2) {
        this.setState({ logInMode: this.state.nextLogInMode });
        this.state.panelTransition.removeListener(listenerID);
      }
    };
    listenerID = this.state.panelTransition.addListener(listener);

    Animated.timing(this.state.panelTransition, {
      duration,
      easing: Easing.out(Easing.ease),
      toValue: 2,
    }).start();

    this.inCoupleSecondsNavigateToLogIn();
  };

  async inCoupleSecondsNavigateToLogIn() {
    await sleep(2350);
    this.backFromLogInMode();
  }
}

const styles = StyleSheet.create({
  forgotPasswordSuccessIcon: {
    marginTop: 40,
    textAlign: 'center',
  },
  forgotPasswordSuccessText: {
    color: 'white',
    fontSize: 18,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 10,
    textAlign: 'center',
  },
  panel: {
    left: 0,
    position: 'absolute',
    right: 0,
  },
});

export default connect((state: AppState) => ({
  dimensions: dimensionsSelector(state),
}))(LogInPanelContainer);
