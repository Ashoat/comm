// @flow

import type { RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import invariant from 'invariant';
import * as React from 'react';
import {
  View,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
} from 'react-native';
import Animated, {
  SlideInDown,
  SlideOutDown,
  runOnJS,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import type { SetState } from 'lib/types/hook-types';

import { ChatContext, type ChatContextType } from '../chat/chat-context';
import SWMansionIcon from '../components/swmansion-icon.react';
import type { AppNavigationProp } from '../navigation/app-navigator.react';
import {
  OverlayContext,
  type OverlayContextType,
} from '../navigation/overlay-context';
import type { TooltipModalParamList } from '../navigation/route-names';
import { type DimensionsInfo } from '../redux/dimensions-updater.react';
import { useSelector } from '../redux/redux-utils';
import { useStyles } from '../themes/colors';
import {
  type VerticalBounds,
  type LayoutCoordinates,
} from '../types/layout-types';
import type { LayoutEvent } from '../types/react-native';
import { AnimatedView } from '../types/styles';
import {
  TooltipContextProvider,
  TooltipContext,
  type TooltipContextType,
} from './tooltip-context.react';
import BaseTooltipItem, {
  type TooltipItemBaseProps,
} from './tooltip-item.react';

/* eslint-disable import/no-named-as-default-member */
const { Value, Node, Extrapolate, add, multiply, interpolateNode } = Animated;
/* eslint-enable import/no-named-as-default-member */

export type TooltipParams<CustomProps> = {
  ...CustomProps,
  +presentedFrom: string,
  +initialCoordinates: LayoutCoordinates,
  +verticalBounds: VerticalBounds,
  +tooltipLocation?: 'above' | 'below' | 'fixed',
  +margin?: number,
  +visibleEntryIDs?: $ReadOnlyArray<string>,
  +chatInputBarHeight?: number,
};
export type TooltipRoute<RouteName: $Keys<TooltipModalParamList>> = RouteProp<
  TooltipModalParamList,
  RouteName,
>;

export type BaseTooltipProps<RouteName> = {
  +navigation: AppNavigationProp<RouteName>,
  +route: TooltipRoute<RouteName>,
};
type ButtonProps<Base> = {
  ...Base,
  +progress: Node,
  +isOpeningSidebar: boolean,
  +setHideTooltip: SetState<boolean>,
  +showEmojiKeyboard: SharedValue<boolean>,
};
type TooltipProps<Base> = {
  ...Base,
  // Redux state
  +dimensions: DimensionsInfo,
  +overlayContext: ?OverlayContextType,
  +chatContext: ?ChatContextType,
  +actionSheetShown: SharedValue<boolean>,
  +hideTooltip: boolean,
  +setHideTooltip: SetState<boolean>,
  +showEmojiKeyboard: SharedValue<boolean>,
  +exitAnimationWorklet: (finished: boolean) => void,
  +styles: typeof unboundStyles,
  +tooltipContext: TooltipContextType,
  +closeTooltip: () => mixed,
  +boundTooltipItem: React.ComponentType<TooltipItemBaseProps>,
};

export type TooltipMenuProps<RouteName> = {
  ...BaseTooltipProps<RouteName>,
  +tooltipItem: React.ComponentType<TooltipItemBaseProps>,
};

function createTooltip<
  RouteName: $Keys<TooltipModalParamList>,
  BaseTooltipPropsType: BaseTooltipProps<RouteName> = BaseTooltipProps<RouteName>,
>(
  ButtonComponent: React.ComponentType<ButtonProps<BaseTooltipPropsType>>,
  MenuComponent: React.ComponentType<TooltipMenuProps<RouteName>>,
): React.ComponentType<BaseTooltipPropsType> {
  class Tooltip extends React.PureComponent<
    TooltipProps<BaseTooltipPropsType>,
  > {
    backdropOpacity: Node;
    tooltipContainerOpacity: Node;
    tooltipVerticalAbove: Node;
    tooltipVerticalBelow: Node;
    tooltipHorizontalOffset: Value = new Value(0);
    tooltipHorizontal: Node;
    tooltipScale: Node;

    constructor(props: TooltipProps<BaseTooltipPropsType>) {
      super(props);

      const { overlayContext } = props;
      invariant(overlayContext, 'Tooltip should have OverlayContext');
      const { position } = overlayContext;

      this.backdropOpacity = interpolateNode(position, {
        inputRange: [0, 1],
        outputRange: [0, 0.7],
        extrapolate: Extrapolate.CLAMP,
      });
      this.tooltipContainerOpacity = interpolateNode(position, {
        inputRange: [0, 0.1],
        outputRange: [0, 1],
        extrapolate: Extrapolate.CLAMP,
      });

      const { margin } = this;
      this.tooltipVerticalAbove = interpolateNode(position, {
        inputRange: [0, 1],
        outputRange: [margin + this.tooltipHeight / 2, 0],
        extrapolate: Extrapolate.CLAMP,
      });
      this.tooltipVerticalBelow = interpolateNode(position, {
        inputRange: [0, 1],
        outputRange: [-margin - this.tooltipHeight / 2, 0],
        extrapolate: Extrapolate.CLAMP,
      });

      this.tooltipHorizontal = multiply(
        add(1, multiply(-1, position)),
        this.tooltipHorizontalOffset,
      );

      this.tooltipScale = interpolateNode(position, {
        inputRange: [0, 0.2, 0.8, 1],
        outputRange: [0, 0, 1, 1],
        extrapolate: Extrapolate.CLAMP,
      });
    }

    componentDidMount() {
      Haptics.impactAsync();
    }

    get tooltipHeight(): number {
      if (this.props.route.params.tooltipLocation === 'fixed') {
        return fixedTooltipHeight;
      } else {
        return tooltipHeight(this.props.tooltipContext.getNumVisibleEntries());
      }
    }

    get tooltipLocation(): 'above' | 'below' | 'fixed' {
      const { params } = this.props.route;
      const { tooltipLocation } = params;
      if (tooltipLocation) {
        return tooltipLocation;
      }

      const { initialCoordinates, verticalBounds } = params;
      const { y, height } = initialCoordinates;
      const contentTop = y;
      const contentBottom = y + height;
      const boundsTop = verticalBounds.y;
      const boundsBottom = verticalBounds.y + verticalBounds.height;

      const { margin, tooltipHeight: curTooltipHeight } = this;
      const fullHeight = curTooltipHeight + margin;
      if (
        contentBottom + fullHeight > boundsBottom &&
        contentTop - fullHeight > boundsTop
      ) {
        return 'above';
      }

      return 'below';
    }

    get opacityStyle() {
      return {
        ...this.props.styles.backdrop,
        opacity: this.backdropOpacity,
      };
    }

    get contentContainerStyle() {
      const { verticalBounds } = this.props.route.params;
      const fullScreenHeight = this.props.dimensions.height;
      const top = verticalBounds.y;
      const bottom =
        fullScreenHeight - verticalBounds.y - verticalBounds.height;
      return {
        ...this.props.styles.contentContainer,
        marginTop: top,
        marginBottom: bottom,
      };
    }

    get buttonStyle() {
      const { params } = this.props.route;
      const { initialCoordinates, verticalBounds } = params;
      const { x, y, width, height } = initialCoordinates;
      return {
        width: Math.ceil(width),
        height: Math.ceil(height),
        marginTop: y - verticalBounds.y,
        marginLeft: x,
      };
    }

    get margin() {
      const customMargin = this.props.route.params.margin;
      return customMargin !== null && customMargin !== undefined
        ? customMargin
        : 20;
    }

    get tooltipContainerStyle() {
      const { dimensions, route } = this.props;
      const {
        initialCoordinates,
        verticalBounds,
        chatInputBarHeight,
      } = route.params;
      const { x, y, width, height } = initialCoordinates;
      const { margin, tooltipLocation } = this;

      const style = {};
      style.position = 'absolute';
      (style.alignItems = 'center'),
        (style.opacity = this.tooltipContainerOpacity);

      if (tooltipLocation !== 'fixed') {
        style.transform = [{ translateX: this.tooltipHorizontal }];
      }

      const extraLeftSpace = x;
      const extraRightSpace = dimensions.width - width - x;
      if (extraLeftSpace < extraRightSpace) {
        style.left = 0;
        style.minWidth = width + 2 * extraLeftSpace;
      } else {
        style.right = 0;
        style.minWidth = width + 2 * extraRightSpace;
      }

      const inputBarHeight = chatInputBarHeight ?? 0;

      if (tooltipLocation === 'fixed') {
        const padding = 8;

        style.minWidth = dimensions.width - 16;
        style.left = 8;
        style.right = 8;
        style.bottom =
          dimensions.height -
          verticalBounds.height -
          verticalBounds.y -
          inputBarHeight +
          padding;
      } else if (tooltipLocation === 'above') {
        style.bottom =
          dimensions.height - Math.max(y, verticalBounds.y) + margin;
        style.transform.push({ translateY: this.tooltipVerticalAbove });
      } else {
        style.top =
          Math.min(y + height, verticalBounds.y + verticalBounds.height) +
          margin;
        style.transform.push({ translateY: this.tooltipVerticalBelow });
      }

      if (tooltipLocation !== 'fixed') {
        style.transform.push({ scale: this.tooltipScale });
      }

      return style;
    }

    render() {
      const {
        dimensions,
        overlayContext,
        chatContext,
        actionSheetShown,
        hideTooltip,
        setHideTooltip,
        showEmojiKeyboard,
        exitAnimationWorklet,
        styles,
        tooltipContext,
        closeTooltip,
        boundTooltipItem,
        ...navAndRouteForFlow
      } = this.props;

      const tooltipContainerStyle = [styles.itemContainer];

      if (this.tooltipLocation === 'fixed') {
        tooltipContainerStyle.push(styles.itemContainerFixed);
      }

      const items = [
        <MenuComponent
          {...navAndRouteForFlow}
          tooltipItem={this.getTooltipItem()}
          key="menu"
        />,
      ];

      if (this.props.tooltipContext.shouldShowMore()) {
        items.push(
          <BaseTooltipItem
            id="more"
            text="More"
            onPress={this.onPressMore}
            renderIcon={this.renderMoreIcon}
            containerStyle={tooltipContainerStyle}
            closeTooltip={this.props.closeTooltip}
            key="more"
          />,
        );
      }

      let triangleStyle;
      const { route } = this.props;
      const { initialCoordinates } = route.params;
      const { x, width } = initialCoordinates;
      const extraLeftSpace = x;
      const extraRightSpace = dimensions.width - width - x;
      if (extraLeftSpace < extraRightSpace) {
        triangleStyle = {
          alignSelf: 'flex-start',
          left: extraLeftSpace + (width - 20) / 2,
        };
      } else {
        triangleStyle = {
          alignSelf: 'flex-end',
          right: extraRightSpace + (width - 20) / 2,
        };
      }

      let triangleDown = null;
      let triangleUp = null;
      const { tooltipLocation } = this;
      if (tooltipLocation === 'above') {
        triangleDown = <View style={[styles.triangleDown, triangleStyle]} />;
      } else if (tooltipLocation === 'below') {
        triangleUp = <View style={[styles.triangleUp, triangleStyle]} />;
      }

      invariant(overlayContext, 'Tooltip should have OverlayContext');
      const { position } = overlayContext;
      const isOpeningSidebar = !!chatContext?.currentTransitionSidebarSourceID;

      const buttonProps: ButtonProps<BaseTooltipPropsType> = {
        ...navAndRouteForFlow,
        progress: position,
        isOpeningSidebar,
        setHideTooltip,
        showEmojiKeyboard,
      };

      const itemsStyles = [styles.items, styles.itemsFixed];

      const animationDelay = Platform.OS === 'ios' ? 200 : 500;
      const enterAnimation = SlideInDown.delay(animationDelay);

      const exitAnimation = SlideOutDown.withCallback(exitAnimationWorklet);

      let tooltip = null;

      if (this.tooltipLocation !== 'fixed') {
        tooltip = (
          <AnimatedView
            style={this.tooltipContainerStyle}
            onLayout={this.onTooltipContainerLayout}
          >
            {triangleUp}
            <View style={styles.items}>{items}</View>
            {triangleDown}
          </AnimatedView>
        );
      } else if (
        this.tooltipLocation === 'fixed' &&
        !hideTooltip &&
        !showEmojiKeyboard.value
      ) {
        tooltip = (
          <AnimatedView
            style={this.tooltipContainerStyle}
            entering={enterAnimation}
            exiting={exitAnimation}
          >
            <View style={itemsStyles}>{items}</View>
          </AnimatedView>
        );
      }

      return (
        <TouchableWithoutFeedback onPress={this.props.closeTooltip}>
          <View style={styles.container}>
            <AnimatedView style={this.opacityStyle} />
            <View style={this.contentContainerStyle}>
              <View style={this.buttonStyle}>
                <ButtonComponent {...buttonProps} />
              </View>
            </View>
            {tooltip}
          </View>
        </TouchableWithoutFeedback>
      );
    }

    getTooltipItem() {
      const BoundTooltipItem = this.props.boundTooltipItem;
      return BoundTooltipItem;
    }

    onPressMore = () => {
      Keyboard.dismiss();
      this.props.actionSheetShown.value = true;
      this.props.setHideTooltip(true);
      this.props.tooltipContext.showActionSheet();
    };

    renderMoreIcon = () => {
      const { styles } = this.props;
      return (
        <SWMansionIcon name="menu-vertical" style={styles.icon} size={16} />
      );
    };

    onTooltipContainerLayout = (event: LayoutEvent) => {
      const { route, dimensions } = this.props;
      const { x, width } = route.params.initialCoordinates;

      const extraLeftSpace = x;
      const extraRightSpace = dimensions.width - width - x;

      const actualWidth = event.nativeEvent.layout.width;
      if (extraLeftSpace < extraRightSpace) {
        const minWidth = width + 2 * extraLeftSpace;
        this.tooltipHorizontalOffset.setValue((minWidth - actualWidth) / 2);
      } else {
        const minWidth = width + 2 * extraRightSpace;
        this.tooltipHorizontalOffset.setValue((actualWidth - minWidth) / 2);
      }
    };
  }
  function ConnectedTooltip(props: BaseTooltipPropsType) {
    const dimensions = useSelector(state => state.dimensions);
    const overlayContext = React.useContext(OverlayContext);
    const chatContext = React.useContext(ChatContext);

    const actionSheetShown = useSharedValue(false);
    const [hideTooltip, setHideTooltip] = React.useState<boolean>(false);

    const showEmojiKeyboard = useSharedValue(false);

    const { goBackOnce } = props.navigation;
    const goBackCallback = React.useCallback(() => {
      if (!actionSheetShown.value) {
        goBackOnce();
      }
    }, [actionSheetShown.value, goBackOnce]);

    const exitAnimationWorklet = React.useCallback(
      finished => {
        'worklet';
        if (finished) {
          runOnJS(goBackCallback)();
        }
      },
      [goBackCallback],
    );

    const { params } = props.route;
    const { tooltipLocation } = params;
    const isFixed = tooltipLocation === 'fixed';

    const closeTooltip = React.useCallback(() => {
      if (isFixed && !actionSheetShown.value) {
        setHideTooltip(true);
      } else {
        goBackOnce();
      }
      showEmojiKeyboard.value = false;
    }, [isFixed, actionSheetShown.value, goBackOnce, showEmojiKeyboard]);

    const styles = useStyles(unboundStyles);
    const boundTooltipItem = React.useCallback(
      innerProps => {
        const containerStyle = isFixed
          ? [styles.itemContainer, styles.itemContainerFixed]
          : styles.itemContainer;
        return (
          <BaseTooltipItem
            {...innerProps}
            containerStyle={containerStyle}
            closeTooltip={closeTooltip}
          />
        );
      },
      [isFixed, styles, closeTooltip],
    );

    const tooltipContext = React.useContext(TooltipContext);
    invariant(tooltipContext, 'TooltipContext should be set in Tooltip');
    return (
      <Tooltip
        {...props}
        dimensions={dimensions}
        overlayContext={overlayContext}
        chatContext={chatContext}
        actionSheetShown={actionSheetShown}
        hideTooltip={hideTooltip}
        setHideTooltip={setHideTooltip}
        showEmojiKeyboard={showEmojiKeyboard}
        exitAnimationWorklet={exitAnimationWorklet}
        styles={styles}
        tooltipContext={tooltipContext}
        closeTooltip={closeTooltip}
        boundTooltipItem={boundTooltipItem}
      />
    );
  }
  function MemoizedTooltip(props: BaseTooltipPropsType) {
    const { visibleEntryIDs } = props.route.params;
    const { goBackOnce } = props.navigation;
    return (
      <TooltipContextProvider
        maxOptionsToDisplay={4}
        visibleEntryIDs={visibleEntryIDs}
        cancel={goBackOnce}
      >
        <ConnectedTooltip {...props} />
      </TooltipContextProvider>
    );
  }
  return React.memo<BaseTooltipPropsType>(MemoizedTooltip);
}

const unboundStyles = {
  backdrop: {
    backgroundColor: 'black',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  icon: {
    color: 'modalForegroundLabel',
  },
  itemContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
  },
  itemContainerFixed: {
    flexDirection: 'column',
  },
  items: {
    backgroundColor: 'tooltipBackground',
    borderRadius: 5,
    overflow: 'hidden',
  },
  itemsFixed: {
    flex: 1,
    flexDirection: 'row',
  },
  triangleDown: {
    borderBottomColor: 'transparent',
    borderBottomWidth: 0,
    borderLeftColor: 'transparent',
    borderLeftWidth: 10,
    borderRightColor: 'transparent',
    borderRightWidth: 10,
    borderStyle: 'solid',
    borderTopColor: 'tooltipBackground',
    borderTopWidth: 10,
    height: 10,
    top: Platform.OS === 'android' ? -1 : 0,
    width: 10,
  },
  triangleUp: {
    borderBottomColor: 'tooltipBackground',
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderLeftWidth: 10,
    borderRightColor: 'transparent',
    borderRightWidth: 10,
    borderStyle: 'solid',
    borderTopColor: 'transparent',
    borderTopWidth: 0,
    bottom: Platform.OS === 'android' ? -1 : 0,
    height: 10,
    width: 10,
  },
};

function tooltipHeight(numEntries: number): number {
  // 10 (triangle) + 37 * numEntries (entries) + numEntries - 1 (padding)
  return 9 + 38 * numEntries;
}

const fixedTooltipHeight: number = 53;

export { createTooltip, fixedTooltipHeight };