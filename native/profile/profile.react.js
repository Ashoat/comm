// @flow

import {
  createStackNavigator,
  type StackNavigationProp,
  type StackHeaderProps,
} from '@react-navigation/stack';
import * as React from 'react';
import { View } from 'react-native';

import KeyboardAvoidingView from '../components/keyboard-avoiding-view.react';
import HeaderBackButton from '../navigation/header-back-button.react';
import {
  ProfileScreenRouteName,
  EditEmailRouteName,
  EditPasswordRouteName,
  DeleteAccountRouteName,
  BuildInfoRouteName,
  DevToolsRouteName,
  AppearancePreferencesRouteName,
  FriendListRouteName,
  BlockListRouteName,
  type ScreenParamList,
  type ProfileParamList,
} from '../navigation/route-names';
import { useStyles } from '../themes/colors';
import AppearancePreferences from './appearance-preferences.react';
import BuildInfo from './build-info.react';
import DeleteAccount from './delete-account.react';
import DevTools from './dev-tools.react';
import EditEmail from './edit-email.react';
import EditPassword from './edit-password.react';
import ProfileHeader from './profile-header.react';
import ProfileScreen from './profile-screen.react';
import RelationshipList from './relationship-list.react';

const header = (props: StackHeaderProps) => <ProfileHeader {...props} />;
const headerBackButton = (props) => <HeaderBackButton {...props} />;
const screenOptions = {
  header,
  headerLeft: headerBackButton,
};
const profileScreenOptions = { headerTitle: 'Profile' };
const editEmailOptions = { headerTitle: 'Change email' };
const editPasswordOptions = { headerTitle: 'Change password' };
const deleteAccountOptions = { headerTitle: 'Delete account' };
const buildInfoOptions = { headerTitle: 'Build info' };
const devToolsOptions = { headerTitle: 'Developer tools' };
const appearanceOptions = { headerTitle: 'Appearance' };
const friendListOptions = {
  headerTitle: 'Friend list',
  headerBackTitle: 'Back',
};
const blockListOptions = {
  headerTitle: 'Block list',
  headerBackTitle: 'Back',
};

export type ProfileNavigationProp<
  RouteName: $Keys<ProfileParamList> = $Keys<ProfileParamList>,
> = StackNavigationProp<ScreenParamList, RouteName>;

const Profile = createStackNavigator<
  ScreenParamList,
  ProfileParamList,
  ProfileNavigationProp<>,
>();
function ProfileComponent() {
  const styles = useStyles(unboundStyles);
  return (
    <View style={styles.view}>
      <KeyboardAvoidingView
        behavior="padding"
        style={styles.keyboardAvoidingView}
      >
        <Profile.Navigator
          screenOptions={screenOptions}
          detachInactiveScreens={false}
        >
          <Profile.Screen
            name={ProfileScreenRouteName}
            component={ProfileScreen}
            options={profileScreenOptions}
          />
          <Profile.Screen
            name={EditEmailRouteName}
            component={EditEmail}
            options={editEmailOptions}
          />
          <Profile.Screen
            name={EditPasswordRouteName}
            component={EditPassword}
            options={editPasswordOptions}
          />
          <Profile.Screen
            name={DeleteAccountRouteName}
            component={DeleteAccount}
            options={deleteAccountOptions}
          />
          <Profile.Screen
            name={BuildInfoRouteName}
            component={BuildInfo}
            options={buildInfoOptions}
          />
          <Profile.Screen
            name={DevToolsRouteName}
            component={DevTools}
            options={devToolsOptions}
          />
          <Profile.Screen
            name={AppearancePreferencesRouteName}
            component={AppearancePreferences}
            options={appearanceOptions}
          />
          <Profile.Screen
            name={FriendListRouteName}
            component={RelationshipList}
            options={friendListOptions}
          />
          <Profile.Screen
            name={BlockListRouteName}
            component={RelationshipList}
            options={blockListOptions}
          />
        </Profile.Navigator>
      </KeyboardAvoidingView>
    </View>
  );
}

const unboundStyles = {
  keyboardAvoidingView: {
    flex: 1,
  },
  view: {
    flex: 1,
    backgroundColor: 'panelBackground',
  },
};

export default ProfileComponent;
