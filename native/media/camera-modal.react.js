// @flow

import type {
  NavigationStackProp,
  NavigationLeafRoute,
  NavigationStackScene,
  NavigationStackTransitionProps,
} from 'react-navigation-stack';
import type { AppState } from '../redux/redux-setup';
import { type Dimensions, dimensionsPropType } from 'lib/types/media-types';
import type { DispatchActionPayload } from 'lib/utils/action-utils';
import { updateDeviceCameraInfoActionType } from '../redux/action-types';
import {
  type DeviceCameraInfo,
  deviceCameraInfoPropType,
} from '../types/camera';

import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import PropTypes from 'prop-types';
import Animated from 'react-native-reanimated';
import { RNCamera } from 'react-native-camera';
import {
  PinchGestureHandler,
  TapGestureHandler,
  State as GestureState,
} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';
import IonIcon from 'react-native-vector-icons/Ionicons';
import Orientation from 'react-native-orientation-locker';

import { connect } from 'lib/utils/redux-utils';

import {
  contentBottomOffset,
  dimensionsSelector,
  contentVerticalOffsetSelector,
} from '../selectors/dimension-selectors';
import ConnectedStatusBar from '../connected-status-bar.react';
import { gestureJustEnded } from '../utils/animation-utils';
import ContentLoading from '../components/content-loading.react';
import { colors } from '../themes/colors';

const {
  Value,
  event,
  Extrapolate,
  block,
  set,
  call,
  cond,
  and,
  or,
  eq,
  greaterThan,
  lessThan,
  add,
  sub,
  multiply,
  divide,
  abs,
  interpolate,
} = Animated;
const maxZoom = 8;
const zoomUpdateFactor = (() => {
  if (Platform.OS === "ios") {
    return 0.002;
  }
  if (Platform.OS === "android" && Platform.Version > 26) {
    return 0.005;
  }
  if (Platform.OS === "android" && Platform.Version > 23) {
    return 0.01;
  }
  return 0.03;
})();
const permissionRationale = {
  title: "Access Your Camera",
  message: "Requesting access to your device camera",
};

type Props = {
  navigation: NavigationStackProp<NavigationLeafRoute>,
  scene: NavigationStackScene,
  transitionProps: NavigationStackTransitionProps,
  position: Value,
  // Redux state
  screenDimensions: Dimensions,
  contentVerticalOffset: number,
  deviceCameraInfo: DeviceCameraInfo,
  // Redux dispatch functions
  dispatchActionPayload: DispatchActionPayload,
};
type State = {|
  zoom: number,
  useFrontCamera: bool,
  hasCamerasOnBothSides: bool,
  flashMode: number,
|};
class CameraModal extends React.PureComponent<Props, State> {

  static propTypes = {
    navigation: PropTypes.shape({
      goBack: PropTypes.func.isRequired,
    }).isRequired,
    scene: PropTypes.object.isRequired,
    transitionProps: PropTypes.object.isRequired,
    position: PropTypes.instanceOf(Value).isRequired,
    screenDimensions: dimensionsPropType.isRequired,
    contentVerticalOffset: PropTypes.number.isRequired,
    deviceCameraInfo: deviceCameraInfoPropType.isRequired,
    dispatchActionPayload: PropTypes.func.isRequired,
  };

  pinchEvent;
  pinchHandler = React.createRef();
  tapEvent;
  tapHandler = React.createRef();
  navigationProgress: Value;
  animationCode: Value;

  closeButton: ?TouchableOpacity;
  closeButtonX = new Value(-1);
  closeButtonY = new Value(-1);
  closeButtonWidth = new Value(0);
  closeButtonHeight = new Value(0);

  photoButton: ?TouchableOpacity;
  photoButtonX = new Value(-1);
  photoButtonY = new Value(-1);
  photoButtonWidth = new Value(0);
  photoButtonHeight = new Value(0);

  switchCameraButton: ?TouchableOpacity;
  switchCameraButtonX = new Value(-1);
  switchCameraButtonY = new Value(-1);
  switchCameraButtonWidth = new Value(0);
  switchCameraButtonHeight = new Value(0);

  flashButton: ?TouchableOpacity;
  flashButtonX = new Value(-1);
  flashButtonY = new Value(-1);
  flashButtonWidth = new Value(0);
  flashButtonHeight = new Value(0);

  cameraIDsFetched = false;

  constructor(props: Props) {
    super(props);

    this.state = {
      zoom: 0,
      useFrontCamera: props.deviceCameraInfo.defaultUseFrontCamera,
      hasCamerasOnBothSides: props.deviceCameraInfo.hasCamerasOnBothSides,
      flashMode: RNCamera.Constants.FlashMode.off,
    };

    const { position } = props;
    const { index } = props.scene;
    this.navigationProgress = interpolate(
      position,
      {
        inputRange: [ index - 1, index ],
        outputRange: [ 0, 1 ],
        extrapolate: Extrapolate.CLAMP,
      },
    );

    const pinchState = new Value(-1);
    const pinchScale = new Value(1);
    this.pinchEvent = event([{
      nativeEvent: {
        state: pinchState,
        scale: pinchScale,
      },
    }]);

    const tapState = new Value(-1);
    const tapX = new Value(0);
    const tapY = new Value(0);
    this.tapEvent = event([{
      nativeEvent: {
        state: tapState,
        x: tapX,
        y: tapY,
      },
    }]);

    this.animationCode = block([
      this.zoomAnimationCode(pinchState, pinchScale),
      this.focusAnimationCode(tapState, tapX, tapY),
    ]);
  }

  zoomAnimationCode(pinchState: Value, pinchScale: Value): Value {
    const pinchJustEnded = gestureJustEnded(pinchState);

    const zoomBase = new Value(1);
    const zoomReported = new Value(1);

    const currentZoom = interpolate(
      multiply(zoomBase, pinchScale),
      {
        inputRange: [ 1, 8 ],
        outputRange: [ 1, 8 ],
        extrapolate: Extrapolate.CLAMP,
      },
    );
    const cameraZoomFactor = interpolate(
      zoomReported,
      {
        inputRange: [ 1, 8 ],
        outputRange: [ 0, 1 ],
        extrapolate: Extrapolate.CLAMP,
      },
    );
    const resolvedZoom = cond(
      eq(pinchState, GestureState.ACTIVE),
      currentZoom,
      zoomBase,
    );

    return [
      cond(
        pinchJustEnded,
        set(zoomBase, currentZoom),
      ),
      cond(
        or(
          pinchJustEnded,
          greaterThan(
            abs(sub(divide(resolvedZoom, zoomReported), 1)),
            zoomUpdateFactor,
          ),
        ),
        [
          set(zoomReported, resolvedZoom),
          call(
            [ cameraZoomFactor ],
            this.updateZoom,
          ),
        ],
      ),
    ];
  }

  focusAnimationCode(tapState: Value, tapX: Value, tapY: Value): Value {
    const lastTapX = new Value(0);
    const lastTapY = new Value(0);
    const tapJustEnded = and(
      gestureJustEnded(tapState),
      this.outsideButtons(lastTapX, lastTapY),
    );
    return [
      cond(
        tapJustEnded,
        call(
          [ tapX, tapY ],
          this.focusOnPoint,
        ),
      ),
      set(lastTapX, tapX),
      set(lastTapY, tapY),
    ];
  }

  outsideButtons(x: Value, y: Value) {
    const {
      closeButtonX,
      closeButtonY,
      closeButtonWidth,
      closeButtonHeight,
      photoButtonX,
      photoButtonY,
      photoButtonWidth,
      photoButtonHeight,
      switchCameraButtonX,
      switchCameraButtonY,
      switchCameraButtonWidth,
      switchCameraButtonHeight,
      flashButtonX,
      flashButtonY,
      flashButtonWidth,
      flashButtonHeight,
    } = this;
    return and(
      or(
        lessThan(x, closeButtonX),
        greaterThan(x, add(closeButtonX, closeButtonWidth)),
        lessThan(y, closeButtonY),
        greaterThan(y, add(closeButtonY, closeButtonHeight)),
      ),
      or(
        lessThan(x, photoButtonX),
        greaterThan(x, add(photoButtonX, photoButtonWidth)),
        lessThan(y, photoButtonY),
        greaterThan(y, add(photoButtonY, photoButtonHeight)),
      ),
      or(
        lessThan(x, switchCameraButtonX),
        greaterThan(x, add(switchCameraButtonX, switchCameraButtonWidth)),
        lessThan(y, switchCameraButtonY),
        greaterThan(y, add(switchCameraButtonY, switchCameraButtonHeight)),
      ),
      or(
        lessThan(x, flashButtonX),
        greaterThan(x, add(flashButtonX, flashButtonWidth)),
        lessThan(y, flashButtonY),
        greaterThan(y, add(flashButtonY, flashButtonHeight)),
      ),
    );
  }

  static isActive(props) {
    const { index } = props.scene;
    return index === props.transitionProps.index;
  }

  componentDidMount() {
    if (CameraModal.isActive(this.props)) {
      Orientation.unlockAllOrientations();
    }
  }

  componentWillUnmount() {
    if (CameraModal.isActive(this.props)) {
      Orientation.lockToPortrait();
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const isActive = CameraModal.isActive(this.props);
    const wasActive = CameraModal.isActive(prevProps);
    if (isActive && !wasActive) {
      Orientation.unlockAllOrientations();
    } else if (!isActive && wasActive) {
      Orientation.lockToPortrait();
    }

    if (!this.state.hasCamerasOnBothSides && prevState.hasCamerasOnBothSides) {
      this.switchCameraButtonX.setValue(-1);
      this.switchCameraButtonY.setValue(-1);
      this.switchCameraButtonWidth.setValue(0);
      this.switchCameraButtonHeight.setValue(0);
    }
  }

  get containerStyle() {
    return {
      ...styles.container,
      opacity: this.navigationProgress,
    };
  }

  renderCamera = ({ camera, status }) => {
    if (camera && camera._cameraHandle) {
      this.fetchCameraIDs(camera);
    }
    const topButtonStyle = {
      top: Math.max(this.props.contentVerticalOffset, 6),
    };
    return (
      <>
        {this.renderCameraContent(status)}
        <TouchableOpacity
          onPress={this.close}
          onLayout={this.onCloseButtonLayout}
          style={[ styles.closeButton, topButtonStyle ]}
          ref={this.closeButtonRef}
        >
          <Text style={styles.closeIcon}>×</Text>
        </TouchableOpacity>
      </>
    );
  }

  renderCameraContent(status) {
    if (status === 'PENDING_AUTHORIZATION') {
      return <ContentLoading fillType="flex" colors={colors.dark} />;
    } else if (status === 'NOT_AUTHORIZED') {
      return (
        <View style={styles.authorizationDeniedContainer}>
          <Text style={styles.authorizationDeniedText}>
            {"don't have permission :("}
          </Text>
        </View>
      );
    }

    let switchCameraButton = null;
    if (this.state.hasCamerasOnBothSides) {
      switchCameraButton = (
        <TouchableOpacity
          onPress={this.switchCamera}
          onLayout={this.onSwitchCameraButtonLayout}
          style={styles.switchCameraButton}
          ref={this.switchCameraButtonRef}
        >
          <Icon
            name="ios-reverse-camera"
            style={styles.switchCameraIcon}
          />
        </TouchableOpacity>
      );
    }

    let flashIcon;
    if (this.state.flashMode === RNCamera.Constants.FlashMode.on) {
      flashIcon = <IonIcon name="ios-flash" style={styles.flashIcon} />;
    } else if (this.state.flashMode === RNCamera.Constants.FlashMode.off) {
      flashIcon = <IonIcon name="ios-flash-off" style={styles.flashIcon} />;
    } else {
      flashIcon = (
        <>
          <IonIcon name="ios-flash" style={styles.flashIcon} />
          <Text style={styles.flashIconAutoText}>A</Text>
        </>
      );
    }

    const topButtonStyle = {
      top: Math.max(this.props.contentVerticalOffset, 6),
    };
    return (
      <>
        <TouchableOpacity
          onPress={this.changeFlashMode}
          onLayout={this.onFlashButtonLayout}
          style={[ styles.flashButton, topButtonStyle ]}
          ref={this.flashButtonRef}
        >
          {flashIcon}
        </TouchableOpacity>
        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity
            onPress={this.takePhoto}
            onLayout={this.onPhotoButtonLayout}
            style={styles.saveButton}
            ref={this.photoButtonRef}
          >
            <View style={styles.saveButtonInner} />
          </TouchableOpacity>
          {switchCameraButton}
        </View>
      </>
    );
  }

  render() {
    const statusBar = CameraModal.isActive(this.props)
      ? <ConnectedStatusBar hidden />
      : null;
    const type = this.state.useFrontCamera
      ? RNCamera.Constants.Type.front
      : RNCamera.Constants.Type.back;
    return (
      <PinchGestureHandler
        onGestureEvent={this.pinchEvent}
        onHandlerStateChange={this.pinchEvent}
        simultaneousHandlers={this.tapHandler}
        ref={this.pinchHandler}
      >
        <Animated.View style={this.containerStyle}>
          {statusBar}
          <Animated.Code exec={this.animationCode} />
          <TapGestureHandler
            onHandlerStateChange={this.tapEvent}
            simultaneousHandlers={this.pinchHandler}
            waitFor={this.pinchHandler}
            ref={this.tapHandler}
          >
            <Animated.View style={styles.fill}>
              <RNCamera
                type={type}
                captureAudio={false}
                maxZoom={maxZoom}
                zoom={this.state.zoom}
                flashMode={this.state.flashMode}
                style={styles.fill}
                androidCameraPermissionOptions={permissionRationale}
              >
                {this.renderCamera}
              </RNCamera>
            </Animated.View>
          </TapGestureHandler>
        </Animated.View>
      </PinchGestureHandler>
    );
  }

  closeButtonRef = (closeButton: ?TouchableOpacity) => {
    this.closeButton = closeButton;
  }

  onCloseButtonLayout = () => {
    const { closeButton } = this;
    if (!closeButton) {
      return;
    }
    closeButton.measure((x, y, width, height, pageX, pageY) => {
      this.closeButtonX.setValue(pageX);
      this.closeButtonY.setValue(pageY);
      this.closeButtonWidth.setValue(width);
      this.closeButtonHeight.setValue(height);
    });
  }

  photoButtonRef = (photoButton: ?TouchableOpacity) => {
    this.photoButton = photoButton;
  }

  onPhotoButtonLayout = () => {
    const { photoButton } = this;
    if (!photoButton) {
      return;
    }
    photoButton.measure((x, y, width, height, pageX, pageY) => {
      this.photoButtonX.setValue(pageX);
      this.photoButtonY.setValue(pageY);
      this.photoButtonWidth.setValue(width);
      this.photoButtonHeight.setValue(height);
    });
  }

  switchCameraButtonRef = (switchCameraButton: ?TouchableOpacity) => {
    this.switchCameraButton = switchCameraButton;
  }

  onSwitchCameraButtonLayout = () => {
    const { switchCameraButton } = this;
    if (!switchCameraButton) {
      return;
    }
    switchCameraButton.measure((x, y, width, height, pageX, pageY) => {
      this.switchCameraButtonX.setValue(pageX);
      this.switchCameraButtonY.setValue(pageY);
      this.switchCameraButtonWidth.setValue(width);
      this.switchCameraButtonHeight.setValue(height);
    });
  }

  flashButtonRef = (flashButton: ?TouchableOpacity) => {
    this.flashButton = flashButton;
  }

  onFlashButtonLayout = () => {
    const { flashButton } = this;
    if (!flashButton) {
      return;
    }
    flashButton.measure((x, y, width, height, pageX, pageY) => {
      this.flashButtonX.setValue(pageX);
      this.flashButtonY.setValue(pageY);
      this.flashButtonWidth.setValue(width);
      this.flashButtonHeight.setValue(height);
    });
  }

  close = () => {
    this.props.navigation.goBack();
  }

  takePhoto = () => {
  }

  switchCamera = () => {
    this.setState((prevState: State) => ({
      useFrontCamera: !prevState.useFrontCamera,
    }));
  }

  updateZoom = ([ zoom ]: [ number ]) => {
    this.setState({ zoom });
  }

  changeFlashMode = () => {
    if (this.state.flashMode === RNCamera.Constants.FlashMode.on) {
      this.setState({ flashMode: RNCamera.Constants.FlashMode.off });
    } else if (this.state.flashMode === RNCamera.Constants.FlashMode.off) {
      this.setState({ flashMode: RNCamera.Constants.FlashMode.auto });
    } else {
      this.setState({ flashMode: RNCamera.Constants.FlashMode.on });
    }
  }

  focusOnPoint = ([ x, y ]: [ number, number ]) => {
    const screenWidth = this.props.screenDimensions.width;
    const screenHeight =
      this.props.screenDimensions.height + contentBottomOffset;
    const relativeX = x / screenWidth;
    const relativeY = y / screenHeight;
    console.log(`tap occurred at ${x}, ${y}. aka ${relativeX}, ${relativeY}`);
  }

  fetchCameraIDs = async (camera: RNCamera) => {
    if (this.cameraIDsFetched) {
      return;
    }
    this.cameraIDsFetched = true;

    const deviceCameras = await camera.getCameraIdsAsync();

    let hasFront = false, hasBack = false, i = 0;
    while ((!hasFront || !hasBack) && i < deviceCameras.length) {
      const deviceCamera = deviceCameras[i];
      if (deviceCamera.type === RNCamera.Constants.Type.front) {
        hasFront = true;
      } else if (deviceCamera.type === RNCamera.Constants.Type.back) {
        hasBack = true;
      }
      i++;
    }

    const hasCamerasOnBothSides = hasFront && hasBack;
    const defaultUseFrontCamera = !hasBack && hasFront;
    if (hasCamerasOnBothSides !== this.state.hasCamerasOnBothSides) {
      this.setState({ hasCamerasOnBothSides });
    }
    const {
      hasCamerasOnBothSides: oldHasCamerasOnBothSides,
      defaultUseFrontCamera: oldDefaultUseFrontCamera,
    } = this.props.deviceCameraInfo;
    if (
      hasCamerasOnBothSides !== oldHasCamerasOnBothSides ||
      defaultUseFrontCamera !== oldDefaultUseFrontCamera
    ) {
      this.props.dispatchActionPayload(
        updateDeviceCameraInfoActionType,
        { hasCamerasOnBothSides, defaultUseFrontCamera },
      );
    }
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  fill: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    left: 24,
  },
  closeIcon: {
    fontSize: 36,
    color: 'white',
    textShadowColor: 'black',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  bottomButtonsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: contentBottomOffset + 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    height: 75,
    width: 75,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonInner: {
    height: 60,
    width: 60,
    borderRadius: 60,
    backgroundColor: '#FFFFFF88',
  },
  switchCameraButton: {
    position: 'absolute',
    right: 26,
    justifyContent: 'center',
  },
  switchCameraIcon: {
    color: 'white',
    fontSize: 36,
    paddingBottom: 2,
    textShadowColor: 'black',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  flashButton: {
    position: 'absolute',
    marginTop: Platform.select({ android: 15, default: 13 }),
    right: 25,
  },
  flashIcon: {
    fontSize: 24,
    color: 'white',
    textShadowColor: 'black',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  flashIconAutoText: {
    position: 'absolute',
    top: -3,
    right: -5,
    fontSize: 10,
    fontWeight: 'bold',
    color: "white",
    textShadowColor: 'black',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  authorizationDeniedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorizationDeniedText: {
    color: colors.dark.listSeparatorLabel,
    fontSize: 28,
    textAlign: 'center',
  },
});

export default connect(
  (state: AppState) => ({
    screenDimensions: dimensionsSelector(state),
    contentVerticalOffset: contentVerticalOffsetSelector(state),
    deviceCameraInfo: state.deviceCameraInfo,
  }),
  null,
  true,
)(CameraModal);
