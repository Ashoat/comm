// @flow

import invariant from 'invariant';
import { type MediaInfo, mediaInfoPropType } from 'lib/types/media-types';
import PropTypes from 'prop-types';
import * as React from 'react';
import { View, Image, StyleSheet } from 'react-native';

import {
  type InputState,
  inputStatePropType,
  InputStateContext,
} from '../input/input-state';

import RemoteImage from './remote-image.react';

type BaseProps = {|
  +mediaInfo: MediaInfo,
  +spinnerColor: string,
|};
type Props = {|
  ...BaseProps,
  // withInputState
  +inputState: ?InputState,
|};
type State = {|
  +currentURI: string,
  +departingURI: ?string,
|};
class Multimedia extends React.PureComponent<Props, State> {
  static propTypes = {
    mediaInfo: mediaInfoPropType.isRequired,
    spinnerColor: PropTypes.string.isRequired,
    inputState: inputStatePropType,
  };
  static defaultProps = {
    spinnerColor: 'black',
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      currentURI: props.mediaInfo.uri,
      departingURI: null,
    };
  }

  get inputState() {
    const { inputState } = this.props;
    invariant(inputState, 'inputState should be set in Multimedia');
    return inputState;
  }

  componentDidMount() {
    this.inputState.reportURIDisplayed(this.state.currentURI, true);
  }

  componentWillUnmount() {
    const { inputState } = this;
    const { currentURI, departingURI } = this.state;
    inputState.reportURIDisplayed(currentURI, false);
    if (departingURI) {
      inputState.reportURIDisplayed(departingURI, false);
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { inputState } = this;

    const newURI = this.props.mediaInfo.uri;
    const oldURI = this.state.currentURI;
    if (newURI !== oldURI) {
      inputState.reportURIDisplayed(newURI, true);

      const { departingURI } = this.state;
      if (departingURI && oldURI !== departingURI) {
        // If there's currently an existing departingURI, that means that oldURI
        // hasn't loaded yet. Since it's being replaced anyways we don't need to
        // display it anymore, so we can unlink it now
        inputState.reportURIDisplayed(oldURI, false);
        this.setState({ currentURI: newURI });
      } else {
        this.setState({ currentURI: newURI, departingURI: oldURI });
      }
    }

    const newDepartingURI = this.state.departingURI;
    const oldDepartingURI = prevState.departingURI;
    if (oldDepartingURI && oldDepartingURI !== newDepartingURI) {
      inputState.reportURIDisplayed(oldDepartingURI, false);
    }
  }

  render() {
    const images = [];
    const { currentURI, departingURI } = this.state;
    if (departingURI) {
      images.push(this.renderURI(currentURI, true));
      images.push(this.renderURI(departingURI, true));
    } else {
      images.push(this.renderURI(currentURI));
    }
    return <View style={styles.container}>{images}</View>;
  }

  renderURI(uri: string, invisibleLoad?: boolean = false) {
    if (uri.startsWith('http')) {
      return (
        <RemoteImage
          uri={uri}
          onLoad={this.onLoad}
          spinnerColor={this.props.spinnerColor}
          style={styles.image}
          invisibleLoad={invisibleLoad}
          key={uri}
        />
      );
    } else {
      const source = { uri };
      return (
        <Image
          source={source}
          onLoad={this.onLoad}
          style={styles.image}
          key={uri}
        />
      );
    }
  }

  onLoad = () => {
    this.setState({ departingURI: null });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});

export default React.memo<BaseProps>(function ConnectedMultimedia(
  props: BaseProps,
) {
  const inputState = React.useContext(InputStateContext);
  return <Multimedia {...props} inputState={inputState} />;
});
