// @flow

import type { NavigationScreenProp, NavigationRoute } from 'react-navigation';
import type { ThreadInfo, RelativeMemberInfo } from 'lib/types/thread-types';
import {
  threadInfoPropType,
  threadPermissions,
  relativeMemberInfoPropType,
} from 'lib/types/thread-types';
import type { AppState } from '../../redux-setup';
import type { DispatchActionPromise } from 'lib/utils/action-utils';
import type {
  ChangeThreadSettingsResult,
  LeaveThreadResult,
} from 'lib/actions/thread-actions';
import type { LoadingStatus } from 'lib/types/loading-types';
import { loadingStatusPropType } from 'lib/types/loading-types';

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Modal from 'react-native-modal';
import invariant from 'invariant';
import _isEqual from 'lodash/fp/isEqual';
import Icon from 'react-native-vector-icons/FontAwesome';
import _every from 'lodash/fp/every';
import _omit from 'lodash/fp/omit';
import shallowequal from 'shallowequal';

import {
  relativeMemberInfoSelectorForMembersOfThread,
} from 'lib/selectors/user-selectors';
import {
  threadInfoSelector,
  childThreadInfos,
} from 'lib/selectors/thread-selectors';
import { createLoadingStatusSelector } from 'lib/selectors/loading-selectors';
import {
  changeThreadSettingsActionTypes,
  changeSingleThreadSetting,
  leaveThreadActionTypes,
  leaveThread,
  removeUsersFromThreadActionTypes,
  changeThreadMemberRolesActionTypes,
} from 'lib/actions/thread-actions';
import {
  includeDispatchActionProps,
  bindServerCalls,
} from 'lib/utils/action-utils';
import { threadHasPermission, viewerIsMember } from 'lib/shared/thread-utils';
import threadWatcher from 'lib/shared/thread-watcher';

import {
  ThreadSettingsCategoryHeader,
  ThreadSettingsCategoryFooter,
} from './thread-settings-category.react';
import EditSettingButton from './edit-setting-button.react';
import Button from '../../components/button.react';
import ThreadSettingsUser from './thread-settings-user.react';
import {
  ThreadSettingsSeeMore,
  ThreadSettingsAddUser,
  ThreadSettingsAddChildThread,
} from './thread-settings-list-action.react';
import AddUsersModal from './add-users-modal.react';
import ThreadSettingsChildThread from './thread-settings-child-thread.react';
import { AddThreadRouteName } from '../add-thread.react';
import { registerChatScreen } from '../chat-screen-registry';
import SaveSettingButton from './save-setting-button.react';
import ThreadSettingsName from './thread-settings-name.react';
import ThreadSettingsColor from './thread-settings-color.react';
import ThreadSettingsDescription from './thread-settings-description.react';
import ThreadSettingsParent from './thread-settings-parent.react';
import ThreadSettingsVisibility from './thread-settings-visibility.react';

const itemPageLength = 5;

type NavProp = NavigationScreenProp<NavigationRoute>
  & { state: { params: { threadInfo: ThreadInfo } } };

type StateProps = {|
  threadInfo: ThreadInfo,
  threadMembers: RelativeMemberInfo[],
  childThreadInfos: ?ThreadInfo[],
  nameEditLoadingStatus: LoadingStatus,
  colorEditLoadingStatus: LoadingStatus,
  descriptionEditLoadingStatus: LoadingStatus,
  leaveThreadLoadingStatus: LoadingStatus,
  removeUsersLoadingStatuses: {[id: string]: LoadingStatus},
  changeRolesLoadingStatuses: {[id: string]: LoadingStatus},
|};
type Props = {|
  navigation: NavProp,
  // Redux state
  ...StateProps,
  // Redux dispatch functions
  dispatchActionPromise: DispatchActionPromise,
  // async functions that hit server APIs
  changeSingleThreadSetting: (
    threadID: string,
    field: "name" | "description" | "color",
    value: string,
  ) => Promise<ChangeThreadSettingsResult>,
  leaveThread: (threadID: string) => Promise<LeaveThreadResult>,
|};
type State = {|
  showAddUsersModal: bool,
  showMaxMembers: number,
  showMaxChildThreads: number,
  nameEditValue: ?string,
  descriptionEditValue: ?string,
  nameTextHeight: ?number,
  descriptionTextHeight: ?number,
  showEditColorModal: bool,
  colorEditValue: string,
|};
class InnerThreadSettings extends React.PureComponent<Props, State> {

  static propTypes = {
    navigation: PropTypes.shape({
      state: PropTypes.shape({
        key: PropTypes.string.isRequired,
        params: PropTypes.shape({
          threadInfo: threadInfoPropType.isRequired,
        }).isRequired,
      }).isRequired,
      navigate: PropTypes.func.isRequired,
      setParams: PropTypes.func.isRequired,
    }).isRequired,
    threadInfo: threadInfoPropType.isRequired,
    threadMembers: PropTypes.arrayOf(relativeMemberInfoPropType).isRequired,
    childThreadInfos: PropTypes.arrayOf(threadInfoPropType),
    nameEditLoadingStatus: loadingStatusPropType.isRequired,
    colorEditLoadingStatus: loadingStatusPropType.isRequired,
    descriptionEditLoadingStatus: loadingStatusPropType.isRequired,
    leaveThreadLoadingStatus: loadingStatusPropType.isRequired,
    dispatchActionPromise: PropTypes.func.isRequired,
    changeSingleThreadSetting: PropTypes.func.isRequired,
  };
  static navigationOptions = ({ navigation }) => ({
    title: navigation.state.params.threadInfo.uiName,
    headerBackTitle: "Back",
  });

  constructor(props: Props) {
    super(props);
    this.state = {
      showAddUsersModal: false,
      showMaxMembers: itemPageLength,
      showMaxChildThreads: itemPageLength,
      nameEditValue: null,
      descriptionEditValue: null,
      nameTextHeight: null,
      descriptionTextHeight: null,
      showEditColorModal: false,
      colorEditValue: props.threadInfo.color,
    };
  }

  componentDidMount() {
    registerChatScreen(this.props.navigation.state.key, this);
    if (!viewerIsMember(this.props.threadInfo)) {
      threadWatcher.watchID(this.props.threadInfo.id);
    }
  }

  componentWillUnmount() {
    registerChatScreen(this.props.navigation.state.key, null);
    if (!viewerIsMember(this.props.threadInfo)) {
      threadWatcher.removeID(this.props.threadInfo.id);
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (
      viewerIsMember(this.props.threadInfo) &&
      !viewerIsMember(nextProps.threadInfo)
    ) {
      threadWatcher.watchID(nextProps.threadInfo.id);
    } else if (
      !viewerIsMember(this.props.threadInfo) &&
      viewerIsMember(nextProps.threadInfo)
    ) {
      threadWatcher.removeID(nextProps.threadInfo.id);
    }

    if (
      !_isEqual(nextProps.threadInfo)
        (this.props.navigation.state.params.threadInfo)
    ) {
      this.props.navigation.setParams({
        threadInfo: nextProps.threadInfo,
      });
    }
    if (
      nextProps.threadInfo.color !== this.props.threadInfo.color &&
      this.state.colorEditValue === this.props.threadInfo.color
    ) {
      this.setState({ colorEditValue: nextProps.threadInfo.color });
    }
  }

  static notLoading =
    (loadingStatus: LoadingStatus) => loadingStatus !== "loading";

  canReset = () => {
    return !this.state.showAddUsersModal &&
      (this.state.nameEditValue === null ||
        this.state.nameEditValue === undefined) &&
      !this.state.showEditColorModal &&
      this.props.nameEditLoadingStatus !== "loading" &&
      this.props.colorEditLoadingStatus !== "loading" &&
      this.props.descriptionEditLoadingStatus !== "loading" &&
      this.props.leaveThreadLoadingStatus !== "loading" &&
      _every(InnerThreadSettings.notLoading)
        (this.props.removeUsersLoadingStatuses) &&
      _every(InnerThreadSettings.notLoading)
        (this.props.changeRolesLoadingStatuses);
  }

  render() {
    const canStartEditing = this.canReset();
    const canEditThread = threadHasPermission(
      this.props.threadInfo,
      threadPermissions.EDIT_THREAD,
    );
    const canChangeSettings = canEditThread && canStartEditing;

    let description = null;
    if (
      (this.state.descriptionEditValue !== null &&
        this.state.descriptionEditValue !== undefined) ||
      this.props.threadInfo.description ||
      canEditThread
    ) {
      description = (
        <ThreadSettingsDescription
          threadInfo={this.props.threadInfo}
          descriptionEditValue={this.state.descriptionEditValue}
          setDescriptionEditValue={this.setDescriptionEditValue}
          descriptionTextHeight={this.state.descriptionTextHeight}
          setDescriptionTextHeight={this.setDescriptionTextHeight}
          canChangeSettings={canChangeSettings}
        />
      );
    }

    let threadMembers;
    let seeMoreMembers = null;
    if (this.props.threadMembers.length > this.state.showMaxMembers) {
      threadMembers =
        this.props.threadMembers.slice(0, this.state.showMaxMembers);
      seeMoreMembers = (
        <ThreadSettingsSeeMore
          onPress={this.onPressSeeMoreMembers}
          key="seeMore"
        />
      );
    } else {
      threadMembers = this.props.threadMembers;
    }
    const members = threadMembers.map(memberInfo => {
      const removeUsersLoadingStatus =
        this.props.removeUsersLoadingStatuses[memberInfo.id];
      const changeRolesLoadingStatus =
        this.props.changeRolesLoadingStatuses[memberInfo.id];
      return (
        <ThreadSettingsUser
          memberInfo={memberInfo}
          threadInfo={this.props.threadInfo}
          canEdit={canStartEditing}
          removeUsersLoadingStatus={removeUsersLoadingStatus}
          changeRolesLoadingStatus={changeRolesLoadingStatus}
          key={memberInfo.id}
        />
      );
    });
    if (seeMoreMembers) {
      members.push(seeMoreMembers);
    }

    let addMembers = null;
    const canAddMembers = threadHasPermission(
      this.props.threadInfo,
      threadPermissions.ADD_MEMBERS,
    );
    if (canAddMembers) {
      addMembers = <ThreadSettingsAddUser onPress={this.onPressAddUser} />;
    }

    let membersPanel = null;
    if (addMembers || members) {
      membersPanel = (
        <View>
          <ThreadSettingsCategoryHeader type="unpadded" title="Members" />
          {addMembers}
          {members}
          <ThreadSettingsCategoryFooter type="unpadded" />
        </View>
      );
    }

    let childThreads = null;
    if (this.props.childThreadInfos) {
      let childThreadInfos;
      let seeMoreChildThreads = null;
      if (this.props.childThreadInfos.length > this.state.showMaxChildThreads) {
        childThreadInfos =
          this.props.childThreadInfos.slice(0, this.state.showMaxChildThreads);
        seeMoreChildThreads = (
          <ThreadSettingsSeeMore
            onPress={this.onPressSeeMoreChildThreads}
            key="seeMore"
          />
        );
      } else {
        childThreadInfos = this.props.childThreadInfos;
      }
      childThreads = childThreadInfos.map(threadInfo => {
        return (
          <ThreadSettingsChildThread
            threadInfo={threadInfo}
            navigate={this.props.navigation.navigate}
            key={threadInfo.id}
          />
        );
      });
      if (seeMoreChildThreads) {
        childThreads.push(seeMoreChildThreads);
      }
    }

    let addChildThread = null;
    const canCreateSubthreads = threadHasPermission(
      this.props.threadInfo,
      threadPermissions.CREATE_SUBTHREADS,
    );
    if (canCreateSubthreads) {
      addChildThread = (
        <ThreadSettingsAddChildThread
          threadInfo={this.props.threadInfo}
          navigate={this.props.navigation.navigate}
        />
      );
    }

    let childThreadPanel = null;
    if (addChildThread || childThreads) {
      childThreadPanel = (
        <View>
          <ThreadSettingsCategoryHeader type="unpadded" title="Child threads" />
          {addChildThread}
          {childThreads}
          <ThreadSettingsCategoryFooter type="unpadded" />
        </View>
      );
    }

    let leaveThreadButton = null;
    if (viewerIsMember(this.props.threadInfo)) {
      const loadingIndicator = this.props.leaveThreadLoadingStatus === "loading"
        ? <ActivityIndicator size="small" />
        : null;
      leaveThreadButton = (
        <View style={styles.leaveThread}>
          <Button
            onPress={this.onPressLeaveThread}
            style={styles.leaveThreadButton}
            iosFormat="highlight"
            iosHighlightUnderlayColor="#EEEEEEDD"
          >
            <Text style={styles.leaveThreadText}>
              Leave thread...
            </Text>
            {loadingIndicator}
          </Button>
        </View>
      );
    }

    return (
      <View>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <ThreadSettingsCategoryHeader type="full" title="Basics" />
          <ThreadSettingsName
            threadInfo={this.props.threadInfo}
            nameEditValue={this.state.nameEditValue}
            setNameEditValue={this.setNameEditValue}
            nameTextHeight={this.state.nameTextHeight}
            setNameTextHeight={this.setNameTextHeight}
            canChangeSettings={canChangeSettings}
          />
          <ThreadSettingsColor
            threadInfo={this.props.threadInfo}
            colorEditValue={this.state.colorEditValue}
            setColorEditValue={this.setColorEditValue}
            showEditColorModal={this.state.showEditColorModal}
            setEditColorModalVisibility={this.setEditColorModalVisibility}
            canChangeSettings={canChangeSettings}
          />
          <ThreadSettingsCategoryFooter type="full" />
          {description}
          <ThreadSettingsCategoryHeader type="full" title="Privacy" />
          <ThreadSettingsParent
            threadInfo={this.props.threadInfo}
            navigate={this.props.navigation.navigate}
          />
          <ThreadSettingsVisibility threadInfo={this.props.threadInfo} />
          <ThreadSettingsCategoryFooter type="full" />
          {childThreadPanel}
          {membersPanel}
          {leaveThreadButton}
        </ScrollView>
        <Modal
          isVisible={this.state.showAddUsersModal}
          onBackButtonPress={this.closeAddUsersModal}
          onBackdropPress={this.closeAddUsersModal}
        >
          <AddUsersModal
            threadInfo={this.props.threadInfo}
            close={this.closeAddUsersModal}
          />
        </Modal>
      </View>
    );
  }

  setNameEditValue = (value: ?string, callback?: () => void) => {
    this.setState({ nameEditValue: value }, callback);
  }

  setNameTextHeight = (height: number) => {
    this.setState({ nameTextHeight: height });
  }

  setEditColorModalVisibility = (visible: bool) => {
    this.setState({ showEditColorModal: visible });
  }

  setColorEditValue = (color: string) => {
    this.setState({ showEditColorModal: false, colorEditValue: color });
  }

  setDescriptionEditValue = (value: ?string, callback?: () => void) => {
    this.setState({ descriptionEditValue: value }, callback);
  }

  setDescriptionTextHeight = (height: number) => {
    this.setState({ descriptionTextHeight: height });
  }

  onPressAddUser = () => {
    this.setState({ showAddUsersModal: true });
  }

  closeAddUsersModal = () => {
    this.setState({ showAddUsersModal: false });
  }

  onPressSeeMoreMembers = () => {
    this.setState(prevState => ({
      showMaxMembers: prevState.showMaxMembers + itemPageLength,
    }));
  }

  onPressSeeMoreChildThreads = () => {
    this.setState(prevState => ({
      showMaxChildThreads: prevState.showMaxChildThreads + itemPageLength,
    }));
  }

  onPressLeaveThread = () => {
    let otherUsersExist = false;
    let otherAdminsExist = false;
    for (let member of this.props.threadMembers) {
      const role = member.role;
      if (role === undefined || role === null || member.isViewer) {
        continue;
      }
      otherUsersExist = true;
      if (this.props.threadInfo.roles[role].name === "Admins") {
        otherAdminsExist = true;
        break;
      }
    }
    if (otherUsersExist && !otherAdminsExist) {
      Alert.alert(
        "Need another admin",
        "Make somebody else an admin before you leave!",
      );
      return;
    }

    Alert.alert(
      "Confirm action",
      "Are you sure you want to leave this thread?",
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: this.onConfirmLeaveThread },
      ],
    );
  }

  onConfirmLeaveThread = () => {
    this.props.dispatchActionPromise(
      leaveThreadActionTypes,
      this.leaveThread(),
    );
  }

  async leaveThread() {
    try {
      return await this.props.leaveThread(this.props.threadInfo.id);
    } catch (e) {
      Alert.alert("Unknown error", "Uhh... try again?");
      throw e;
    }
  }

}

const styles = StyleSheet.create({
  scrollView: {
    paddingVertical: 16,
  },
  leaveThread: {
    marginVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "white",
  },
  leaveThreadButton: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  leaveThreadText: {
    fontSize: 16,
    color: "#AA0000",
    flex: 1,
  },
});

const leaveThreadLoadingStatusSelector
  = createLoadingStatusSelector(leaveThreadActionTypes);

const ThreadSettingsRouteName = 'ThreadSettings';
const ThreadSettings = connect(
  (state: AppState, ownProps: { navigation: NavProp }) => {
    const parsedThreadInfos = threadInfoSelector(state);
    const passedThreadInfo = ownProps.navigation.state.params.threadInfo;
    // We pull the version from Redux so we get updates once they go through
    const threadInfo = parsedThreadInfos[passedThreadInfo.id];
    // We need two LoadingStatuses for each member
    const threadMembers =
      relativeMemberInfoSelectorForMembersOfThread(threadInfo.id)(state);
    const removeUsersLoadingStatuses = {};
    const changeRolesLoadingStatuses = {};
    for (let threadMember of threadMembers) {
      removeUsersLoadingStatuses[threadMember.id] = createLoadingStatusSelector(
        removeUsersFromThreadActionTypes,
        `${removeUsersFromThreadActionTypes.started}:${threadMember.id}`,
      )(state);
      changeRolesLoadingStatuses[threadMember.id] = createLoadingStatusSelector(
        changeThreadMemberRolesActionTypes,
        `${changeThreadMemberRolesActionTypes.started}:${threadMember.id}`,
      )(state);
    }
    return {
      threadInfo,
      threadMembers,
      childThreadInfos: childThreadInfos(state)[threadInfo.id],
      nameEditLoadingStatus: createLoadingStatusSelector(
        changeThreadSettingsActionTypes,
        `${changeThreadSettingsActionTypes.started}:name`,
      )(state),
      colorEditLoadingStatus: createLoadingStatusSelector(
        changeThreadSettingsActionTypes,
        `${changeThreadSettingsActionTypes.started}:color`,
      )(state),
      descriptionEditLoadingStatus: createLoadingStatusSelector(
        changeThreadSettingsActionTypes,
        `${changeThreadSettingsActionTypes.started}:description`,
      )(state),
      leaveThreadLoadingStatus: leaveThreadLoadingStatusSelector(state),
      removeUsersLoadingStatuses,
      changeRolesLoadingStatuses,
      cookie: state.cookie,
    };
  },
  includeDispatchActionProps,
  bindServerCalls({ changeSingleThreadSetting, leaveThread }),
  {
    areStatePropsEqual: (oldProps: StateProps, nextProps: StateProps) => {
      const omitObjects =
        _omit(["removeUsersLoadingStatuses", "changeRolesLoadingStatuses"]);
      return shallowequal(omitObjects(oldProps), omitObjects(nextProps)) &&
        shallowequal(
          oldProps.removeUsersLoadingStatuses,
          nextProps.removeUsersLoadingStatuses,
        ) &&
        shallowequal(
          oldProps.changeRolesLoadingStatuses,
          nextProps.changeRolesLoadingStatuses,
        );
    },
  },
)(InnerThreadSettings);

export {
  ThreadSettings,
  ThreadSettingsRouteName,
};
