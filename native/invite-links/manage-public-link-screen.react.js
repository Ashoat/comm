// @flow

import * as React from 'react';
import { Text, View, Alert } from 'react-native';

import { inviteLinkUrl } from 'lib/facts/links.js';
import { useInviteLinksActions } from 'lib/hooks/invite-links.js';
import { primaryInviteLinksSelector } from 'lib/selectors/invite-links-selectors.js';
import type { ThreadInfo } from 'lib/types/thread-types.js';

import Button from '../components/button.react.js';
import TextInput from '../components/text-input.react.js';
import type { RootNavigationProp } from '../navigation/root-navigator.react.js';
import type { NavigationRoute } from '../navigation/route-names.js';
import { useSelector } from '../redux/redux-utils.js';
import { useStyles } from '../themes/colors.js';

export type ManagePublicLinkScreenParams = {
  +community: ThreadInfo,
};

type Props = {
  +navigation: RootNavigationProp<'ManagePublicLink'>,
  +route: NavigationRoute<'ManagePublicLink'>,
};

function ManagePublicLinkScreen(props: Props): React.Node {
  const { community } = props.route.params;
  const inviteLink = useSelector(primaryInviteLinksSelector)[community.id];
  const {
    error,
    isLoading,
    name,
    setName,
    createOrUpdateInviteLink,
    disableInviteLink,
  } = useInviteLinksActions(community.id, inviteLink);

  const styles = useStyles(unboundStyles);

  let errorComponent = null;
  if (error) {
    errorComponent = <Text style={styles.error}>{error}</Text>;
  }

  const onDisableButtonClick = React.useCallback(() => {
    Alert.alert(
      'Disable public link',
      'Are you sure you want to disable your public link? Members who have your community’s public link but have not joined will not able to with the disabled link. \n' +
        '\n' +
        'Other communities may also claim your previous public link url.',
      [
        {
          text: 'Confirm disable',
          style: 'destructive',
          onPress: disableInviteLink,
        },
        {
          text: 'Cancel',
        },
      ],
      {
        cancelable: true,
      },
    );
  }, [disableInviteLink]);
  let disablePublicLinkButton = null;
  if (inviteLink) {
    disablePublicLinkButton = (
      <View style={styles.destructiveButtonContainer}>
        <Button
          style={[styles.button, styles.destructiveButton]}
          onPress={onDisableButtonClick}
          disabled={isLoading}
        >
          <Text style={styles.destructiveButtonText}>Disable public link</Text>
        </Button>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.section}>
        <Text style={styles.sectionText}>
          Let your community be more accessible with your own unique public
          link. By enabling a public link, you are allowing anyone who has your
          link to join your community.{'\n\n'}
          Editing your community’s public link allows other communities to claim
          your previous URL.
        </Text>
      </View>
      <Text style={styles.sectionTitle}>INVITE URL</Text>
      <View style={styles.section}>
        <View style={styles.inviteLink}>
          <Text style={styles.inviteLinkPrefix}>{inviteLinkUrl('')}</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            autoCorrect={false}
            autoCapitalize="none"
            keyboardType="ascii-capable"
            editable={!isLoading}
          />
        </View>
        {errorComponent}
        <Button
          style={[styles.button, styles.buttonPrimary]}
          onPress={createOrUpdateInviteLink}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Save & enable public link</Text>
        </Button>
      </View>
      {disablePublicLinkButton}
    </View>
  );
}

const unboundStyles = {
  sectionTitle: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: 'modalBackgroundLabel',
    paddingHorizontal: 16,
    paddingBottom: 4,
    marginTop: 24,
  },
  section: {
    borderBottomColor: 'modalSeparator',
    borderBottomWidth: 1,
    borderTopColor: 'modalSeparator',
    borderTopWidth: 1,
    backgroundColor: 'modalForeground',
    padding: 16,
  },
  sectionText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    color: 'modalBackgroundLabel',
  },
  inviteLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inviteLinkPrefix: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    color: 'disabledButtonText',
    marginRight: 2,
  },
  input: {
    color: 'panelForegroundLabel',
    borderColor: 'panelSecondaryForegroundBorder',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 13,
    paddingHorizontal: 16,
    flex: 1,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  buttonPrimary: {
    backgroundColor: 'purpleButton',
  },
  destructiveButtonContainer: {
    margin: 16,
  },
  destructiveButton: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: 'vibrantRedButton',
  },
  destructiveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    color: 'vibrantRedButton',
    textAlign: 'center',
  },
  buttonText: {
    color: 'whiteText',
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
  },
  error: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    textAlign: 'center',
    color: 'redText',
  },
};

export default ManagePublicLinkScreen;
