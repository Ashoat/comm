// @flow

import { type DeviceType, assertDeviceType } from 'lib/types/device-types';
import type { AccessRequest } from 'lib/types/account-types';
import type { DispatchActionPromise } from 'lib/utils/action-utils';
import type { AppState } from '../redux-setup';
import {
  type LoadingStatus,
  loadingStatusPropType,
} from 'lib/types/loading-types';

import * as React from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';

import { validEmailRegex } from 'lib/shared/account-utils';
import { connect } from 'lib/utils/redux-utils';
import {
  requestAccessActionTypes,
  requestAccess,
} from 'lib/actions/user-actions';
import { createLoadingStatusSelector } from 'lib/selectors/loading-selectors';

import css from './splash.css';
import LoadingIndicator from '../loading-indicator.react';
import LogInModal from '../modals/account/log-in-modal.react';

const defaultRequestAccessScrollHeight = 390;

type Props = {
  setModal: (modal: ?React.Node) => void,
  currentModal: ?React.Node,
  // Redux state
  loadingStatus: LoadingStatus,
  // Redux dispatch functions
  dispatchActionPromise: DispatchActionPromise,
  // async functions that hit server APIs
  requestAccess: (accessRequest: AccessRequest) => Promise<void>,
};
type State = {|
  platform: DeviceType,
  email: string,
  error: ?string,
  success: ?string,
|};
class Splash extends React.PureComponent<Props, State> {
  static propTypes = {
    setModal: PropTypes.func.isRequired,
    currentModal: PropTypes.node,
    loadingStatus: loadingStatusPropType.isRequired,
    dispatchActionPromise: PropTypes.func.isRequired,
    requestAccess: PropTypes.func.isRequired,
  };
  emailInput: ?HTMLInputElement;
  bottomContainer: ?HTMLDivElement;
  state = {
    platform: 'ios',
    email: '',
    error: null,
    success: null,
  };

  componentDidMount() {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }

  render() {
    let androidWarning = null;
    if (this.state.platform === 'android') {
      androidWarning = (
        <p className={css.androidWarning}>
          Make sure this is the email you use to log in to the Google Play
          Store!
        </p>
      );
    }
    let error = null;
    if (this.state.error) {
      error = <p className={css.requestAccessError}>{this.state.error}</p>;
    }
    let success = null;
    if (this.state.success) {
      success = (
        <p className={css.requestAccessSuccess}>{this.state.success}</p>
      );
    }
    let submitButtonContent = 'Submit';
    if (this.props.loadingStatus === 'loading') {
      submitButtonContent = (
        <LoadingIndicator status={this.props.loadingStatus} />
      );
    }
    return (
      <React.Fragment>
        <div className={css.headerContainer}>
          <div className={css.top}>
            <header className={css.header}>
              <div className={css.headerContents}>
                <h1>SquadCal</h1>
                <div className={css.actionLinks}>
                  <a href="#" onClick={this.onClickRequestAccess}>
                    <span className={css.requestAccess}>Request access</span>
                  </a>
                  <a href="#" onClick={this.onClickLogIn}>
                    <span>Log in</span>
                  </a>
                </div>
              </div>
            </header>
          </div>
        </div>
        <div className={css.content}>
          <div className={css.topContainer}>
            <div className={css.top}>
              <div className={css.body}>
                <div className={css.intro}>
                  <p className={css.introHeader}>
                    SquadCal is a chat app with an integrated calendar.
                  </p>
                  <p className={css.introDescription}>
                    We make it incredibly easy to plan events with your friends.
                  </p>
                </div>
                <div className={css.devices}>
                  <img
                    src="images/ios_screenshot.png"
                    srcSet="images/ios_screenshot@2x.png 526w"
                    width={263}
                    height={527}
                  />
                  <img
                    src="images/android_screenshot.png"
                    srcSet="images/android_screenshot@2x.png 570w"
                    width={285}
                    height={527}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className={css.bottomContainer} ref={this.bottomContainerRef}>
            <div className={css.bottom}>
              <div className={css.headerRest}>
                <div className={css.prompt}>
                  <p className={css.promptHeader}>
                    We&apos;re currently alpha testing the first version of our
                    app.
                  </p>
                  <p className={css.promptDescription}>
                    If you&apos;d like to try it out, please let us know!
                  </p>
                  <div className={css.requestAccessContainer}>
                    <div>
                      <form className={css.requestAccessForm}>
                        <input
                          type="text"
                          value={this.state.email}
                          onChange={this.onChangeEmail}
                          placeholder="Email address"
                          className={css.requestAccessEmail}
                          ref={this.emailInputRef}
                        />
                        <div className={css.customSelect}>
                          <select onChange={this.onChangePlatform}>
                            <option value="ios">iOS</option>
                            <option value="android">Android</option>
                          </select>
                        </div>
                        <button
                          type="submit"
                          className={css.requestAccessSubmit}
                          onClick={this.onSubmitRequestAccess}
                        >
                          {submitButtonContent}
                        </button>
                      </form>
                      {androidWarning}
                    </div>
                    {error}
                    {success}
                  </div>
                </div>
              </div>
              <div className={css.headerOverscroll} />
            </div>
          </div>
        </div>
        {this.props.currentModal}
      </React.Fragment>
    );
  }

  bottomContainerRef = (bottomContainer: ?HTMLDivElement) => {
    this.bottomContainer = bottomContainer;
  };

  emailInputRef = (emailInput: ?HTMLInputElement) => {
    this.emailInput = emailInput;
  };

  onChangeEmail = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({ email: event.currentTarget.value });
  };

  onChangePlatform = (event: SyntheticEvent<HTMLSelectElement>) => {
    this.setState({ platform: assertDeviceType(event.currentTarget.value) });
  };

  onClickLogIn = (event: SyntheticEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    this.props.setModal(<LogInModal setModal={this.props.setModal} />);
  };

  onClickRequestAccess = (event: SyntheticEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const { bottomContainer } = this;
    invariant(bottomContainer, 'bottomContainer should exist');
    const formHeight = 180;
    const contentHeight = 790;
    const guaranteesSpace = contentHeight - window.innerHeight + formHeight;
    if (bottomContainer.scrollTop < guaranteesSpace) {
      bottomContainer.scrollTop = Math.max(
        defaultRequestAccessScrollHeight,
        guaranteesSpace,
      );
    }
    if (this.emailInput) {
      this.emailInput.focus();
    }
  };

  onSubmitRequestAccess = (event: SyntheticEvent<HTMLInputElement>) => {
    event.preventDefault();

    if (this.state.email.search(validEmailRegex) === -1) {
      this.setState({ success: null, error: 'Please enter a valid email!' });
      invariant(this.emailInput, 'should be set');
      this.emailInput.focus();
      return;
    }

    this.props.dispatchActionPromise(
      requestAccessActionTypes,
      this.requestAccessAction(),
    );
  };

  async requestAccessAction() {
    try {
      await this.props.requestAccess({
        email: this.state.email,
        platform: this.state.platform,
      });
      this.setState({
        success:
          "Thanks for your interest! We'll let you know as soon as " +
          "we're able to extend an invite.",
        error: null,
      });
    } catch (e) {
      this.setState({ success: null, error: 'Unknown error...' });
      throw e;
    }
  }
}

const loadingStatusSelector = createLoadingStatusSelector(
  requestAccessActionTypes,
);
export default connect(
  (state: AppState) => ({
    loadingStatus: loadingStatusSelector(state),
  }),
  { requestAccess },
)(Splash);
