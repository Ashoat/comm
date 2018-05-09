// @flow

import type { AppState } from './redux-setup';
import type { DispatchActionPromise } from 'lib/utils/action-utils';
import type { ThreadInfo } from 'lib/types/thread-types';
import type { LogOutResult } from 'lib/types/account-types';

import * as React from 'react';
import classNames from 'classnames';
import invariant from 'invariant';
import PropTypes from 'prop-types';

import { nullState } from 'lib/selectors/nav-selectors';
import { logOut, logOutActionTypes } from 'lib/actions/user-actions';
import { connect } from 'lib/utils/redux-utils';

import css from './style.css';
import LogInModal from './modals/account/log-in-modal.react';
import RegisterModal from './modals/account/register-modal.react';
import UserSettingsModal from './modals/account/user-settings-modal.react.js';
import { UpCaret, DownCaret } from './vectors.react';
import { htmlTargetFromEvent } from './vector-utils';

type Props = {
  setModal: (modal: React.Node) => void,
  clearModal: () => void,
  modalExists: bool,
  // Redux state
  loggedIn: bool,
  username: ?string,
  nullState: bool,
  // Redux dispatch functions
  dispatchActionPromise: DispatchActionPromise,
  // async functions that hit server APIs
  logOut: () => Promise<LogOutResult>,
};
type State = {
  expanded: bool,
}

class AccountBar extends React.PureComponent<Props, State> {

  menu: ?HTMLDivElement;

  constructor(props: Props) {
    super(props);
    this.state = {
      expanded: false,
    };
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.state.expanded && !prevState.expanded) {
      invariant(this.menu, "menu ref should be set");
      this.menu.focus();
    }
  }

  render() {
    const classes = classNames({
      [css['account-bar']]: true,
      [css['lower-left-null-state']]: this.props.nullState &&
        !this.props.modalExists,
    });
    if (this.props.loggedIn) {
      let menu = null;
      if (this.state.expanded) {
        menu = (
          <div
            className={css['account-menu']}
            tabIndex="0"
            onBlur={this.onBlur}
            onKeyDown={this.onMenuKeyDown}
            ref={this.menuRef}
          >
            <div>
              <a
                href="#"
                onClick={this.onLogOut}
              >Log out</a>
            </div>
            <div>
              <a
                href="#"
                onClick={this.onEditAccount}
              >Edit account</a>
            </div>
          </div>
        );
      }
      const caret = this.state.expanded
        ? <DownCaret className={css['account-caret']} />
        : <UpCaret className={css['account-caret']} />;
      return (
        <div className={classes} onMouseDown={this.onMouseDown}>
          <div className={css['account-button']}>
            <span>{"logged in as "}</span>
            <span className={css['username']}>{this.props.username}</span>
            {caret}
          </div>
          {menu}
        </div>
      );
    } else {
      return (
        <div className={classes}>
          <div className={css['account-button']}>
            <span>
              <a href="#" onClick={this.onLogIn}>Log in</a>
              {" · "}
              <a href="#" onClick={this.onRegister}>Register</a>
            </span>
          </div>
        </div>
      );
    }
  }

  menuRef = (menu: ?HTMLDivElement) => {
    this.menu = menu;
  }

  onBlur = () => {
    this.setState({ expanded: false });
  }

  // Throw away typechecking here because SyntheticEvent isn't typed
  onMenuKeyDown = (event: any) => {
    if (event.keyCode === 27) { // Esc
      this.setState({ expanded: false });
    }
  }

  onMouseDown = (event: SyntheticEvent<HTMLDivElement>) => {
    if (!this.state.expanded) {
      // This prevents onBlur from firing on div.account-menu
      event.preventDefault();
      this.setState({ expanded: true });
      return;
    }
    const target = htmlTargetFromEvent(event);
    invariant(this.menu, "menu ref not set");
    if (this.menu.contains(target)) {
      // This prevents onBlur from firing on div.account-menu
      event.preventDefault();
    } else {
      this.setState({ expanded: false });
    }
  }

  onLogOut = (event: SyntheticEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    this.props.dispatchActionPromise(logOutActionTypes, this.props.logOut());
    this.setState({ expanded: false });
  }

  onEditAccount = (event: SyntheticEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    // This will blur the focus off the menu which will set expanded to false
    this.props.setModal(
      <UserSettingsModal
        onClose={this.props.clearModal}
        setModal={this.props.setModal}
      />
    );
  }

  onLogIn = (event: SyntheticEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    this.props.setModal(
      <LogInModal
        onClose={this.props.clearModal}
        setModal={this.props.setModal}
      />
    );
  }

  onRegister = (event: SyntheticEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    this.props.setModal(
      <RegisterModal
        onClose={this.props.clearModal}
        setModal={this.props.setModal}
      />
    );
  }

}

AccountBar.propTypes = {
  setModal: PropTypes.func.isRequired,
  clearModal: PropTypes.func.isRequired,
  modalExists: PropTypes.bool.isRequired,
  loggedIn: PropTypes.bool.isRequired,
  username: PropTypes.string,
  nullState: PropTypes.bool.isRequired,
  dispatchActionPromise: PropTypes.func.isRequired,
};

export default connect(
  (state: AppState) => ({
    loggedIn: !!(state.currentUserInfo &&
      !state.currentUserInfo.anonymous && true),
    username: state.currentUserInfo && !state.currentUserInfo.anonymous
      ? state.currentUserInfo.username
      : undefined,
    nullState: nullState(state),
  }),
  { logOut },
)(AccountBar);
