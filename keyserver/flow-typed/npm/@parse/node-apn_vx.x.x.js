// flow-typed signature: 4d21eb714d444d66969e90089d6dd605
// flow-typed version: <<STUB>>/@parse/node-apn_v3.2.0/flow_v0.137.0

/**
 * This is an autogenerated libdef stub for:
 *
 *   '@parse/node-apn'
 *
 * Fill this stub out by replacing all the `any` types.
 *
 * Once filled out, we encourage you to share your work with the
 * community by sending a pull request to:
 * https://github.com/flowtype/flow-typed
 */

declare module '@parse/node-apn' {
  declare type NotificationPushType = 'background' | 'alert' | 'voip';
  declare export class Notification {
    constructor(): this;
    length(): number;
    body: string;
    topic: string;
    id: string;
    expiry: number;
    priority: number;
    collapseId: string;
    pushType: NotificationPushType;
    threadId: string;
    payload: any;
    badge: ?number;
    sound: string;
    contentAvailable: boolean;
    mutableContent: boolean;
    urlArgs: string[];
    // Detailed explanation of this field can be found here:
    // https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/generating_a_remote_notification?language=objc#2943363
    // More fields can be added here, if they ever need to 
    // be accessed from apn.Notification instance
    aps: {
      +badge: string | number,
      +alert: string | { +body?: string, ... },
      +'thread-id': string,
      +'mutable-content': boolean,
      +sound: string,
      ...
    };
  }

  declare type ProviderToken = {|
    +key: string,
    +keyId: string,
    +teamId: string,
  |};
  declare export type ProviderOptions = {
    +token?: ProviderToken,
    +production?: boolean,
    ...
  };

  declare export type ResponseSent = {|
    +device: string,
  |};
  declare export type ResponseFailure = {|
    +device: string,
    +error?: ?Error,
    +status?: ?number,
    +response: {|
      +reason: string,
      +timestamp?: ?string,
    |},
  |};
  declare type Responses = {|
    +sent: $ReadOnlyArray<ResponseSent>,
    +failed: $ReadOnlyArray<ResponseFailure>,
  |};

  declare export class Provider extends events$EventEmitter {
    constructor(options: ProviderOptions): this;
    send(
      notification: Notification,
      recipients: string | $ReadOnlyArray<string>,
    ): Promise<Responses>;
    shutdown(): void;
  }

  declare export default {
    +Notification: typeof Notification,
    +Provider: typeof Provider,
    ...
  };
}

/**
 * We include stubs for each file inside this npm package in case you need to
 * require those files directly. Feel free to delete any files that aren't
 * needed.
 */
declare module '@parse/node-apn/examples/sending-multiple-notifications' {
  declare module.exports: any;
}

declare module '@parse/node-apn/examples/sending-to-multiple-devices' {
  declare module.exports: any;
}

declare module '@parse/node-apn/lib/client' {
  declare module.exports: any;
}

declare module '@parse/node-apn/lib/config' {
  declare module.exports: any;
}

declare module '@parse/node-apn/lib/credentials/ca/prepare' {
  declare module.exports: any;
}

declare module '@parse/node-apn/lib/credentials/certificate/APNCertificate' {
  declare module.exports: any;
}

declare module '@parse/node-apn/lib/credentials/certificate/APNKey' {
  declare module.exports: any;
}

declare module '@parse/node-apn/lib/credentials/certificate/load' {
  declare module.exports: any;
}

declare module '@parse/node-apn/lib/credentials/certificate/oids' {
  declare module.exports: any;
}

declare module '@parse/node-apn/lib/credentials/certificate/parse' {
  declare module.exports: any;
}

declare module '@parse/node-apn/lib/credentials/certificate/parsePemCertificate' {
  declare module.exports: any;
}

declare module '@parse/node-apn/lib/credentials/certificate/parsePemKey' {
  declare module.exports: any;
}

declare module '@parse/node-apn/lib/credentials/certificate/parsePkcs12' {
  declare module.exports: any;
}

declare module '@parse/node-apn/lib/credentials/certificate/prepare' {
  declare module.exports: any;
}

declare module '@parse/node-apn/lib/credentials/certificate/validate' {
  declare module.exports: any;
}

declare module '@parse/node-apn/lib/credentials' {
  declare module.exports: any;
}

declare module '@parse/node-apn/lib/credentials/resolve' {
  declare module.exports: any;
}

declare module '@parse/node-apn/lib/credentials/token/prepare' {
  declare module.exports: any;
}

declare module '@parse/node-apn/lib/notification/apsProperties' {
  declare module.exports: any;
}

declare module '@parse/node-apn/lib/notification' {
  declare module.exports: any;
}

declare module '@parse/node-apn/lib/protocol/endpoint' {
  declare module.exports: any;
}

declare module '@parse/node-apn/lib/protocol/endpointManager' {
  declare module.exports: any;
}

declare module '@parse/node-apn/lib/provider' {
  declare module.exports: any;
}

declare module '@parse/node-apn/lib/token' {
  declare module.exports: any;
}

declare module '@parse/node-apn/lib/util/extend' {
  declare module.exports: any;
}

declare module '@parse/node-apn/mock/client' {
  declare module.exports: any;
}

declare module '@parse/node-apn/mock' {
  declare module.exports: any;
}

declare module '@parse/node-apn/test/client' {
  declare module.exports: any;
}

declare module '@parse/node-apn/test/config' {
  declare module.exports: any;
}

declare module '@parse/node-apn/test/credentials/ca/prepare' {
  declare module.exports: any;
}

declare module '@parse/node-apn/test/credentials/certificate/APNCertificate' {
  declare module.exports: any;
}

declare module '@parse/node-apn/test/credentials/certificate/APNKey' {
  declare module.exports: any;
}

declare module '@parse/node-apn/test/credentials/certificate/load' {
  declare module.exports: any;
}

declare module '@parse/node-apn/test/credentials/certificate/parse' {
  declare module.exports: any;
}

declare module '@parse/node-apn/test/credentials/certificate/parsePemCertificate' {
  declare module.exports: any;
}

declare module '@parse/node-apn/test/credentials/certificate/parsePemKey' {
  declare module.exports: any;
}

declare module '@parse/node-apn/test/credentials/certificate/parsePkcs12' {
  declare module.exports: any;
}

declare module '@parse/node-apn/test/credentials/certificate/prepare' {
  declare module.exports: any;
}

declare module '@parse/node-apn/test/credentials/certificate/validate' {
  declare module.exports: any;
}

declare module '@parse/node-apn/test/credentials/resolve' {
  declare module.exports: any;
}

declare module '@parse/node-apn/test/credentials/token/prepare' {
  declare module.exports: any;
}

declare module '@parse/node-apn/test/notification/apsProperties' {
  declare module.exports: any;
}

declare module '@parse/node-apn/test/notification' {
  declare module.exports: any;
}

declare module '@parse/node-apn/test/protocol/endpoint' {
  declare module.exports: any;
}

declare module '@parse/node-apn/test/protocol/endpointManager' {
  declare module.exports: any;
}

declare module '@parse/node-apn/test/provider' {
  declare module.exports: any;
}

declare module '@parse/node-apn/test/support' {
  declare module.exports: any;
}

declare module '@parse/node-apn/test/token' {
  declare module.exports: any;
}

// Filename aliases
declare module '@parse/node-apn/examples/sending-multiple-notifications.js' {
  declare module.exports: $Exports<'@parse/node-apn/examples/sending-multiple-notifications'>;
}
declare module '@parse/node-apn/examples/sending-to-multiple-devices.js' {
  declare module.exports: $Exports<'@parse/node-apn/examples/sending-to-multiple-devices'>;
}
declare module '@parse/node-apn/index' {
  declare module.exports: $Exports<'@parse/node-apn'>;
}
declare module '@parse/node-apn/index.js' {
  declare module.exports: $Exports<'@parse/node-apn'>;
}
declare module '@parse/node-apn/lib/client.js' {
  declare module.exports: $Exports<'@parse/node-apn/lib/client'>;
}
declare module '@parse/node-apn/lib/config.js' {
  declare module.exports: $Exports<'@parse/node-apn/lib/config'>;
}
declare module '@parse/node-apn/lib/credentials/ca/prepare.js' {
  declare module.exports: $Exports<'@parse/node-apn/lib/credentials/ca/prepare'>;
}
declare module '@parse/node-apn/lib/credentials/certificate/APNCertificate.js' {
  declare module.exports: $Exports<'@parse/node-apn/lib/credentials/certificate/APNCertificate'>;
}
declare module '@parse/node-apn/lib/credentials/certificate/APNKey.js' {
  declare module.exports: $Exports<'@parse/node-apn/lib/credentials/certificate/APNKey'>;
}
declare module '@parse/node-apn/lib/credentials/certificate/load.js' {
  declare module.exports: $Exports<'@parse/node-apn/lib/credentials/certificate/load'>;
}
declare module '@parse/node-apn/lib/credentials/certificate/oids.js' {
  declare module.exports: $Exports<'@parse/node-apn/lib/credentials/certificate/oids'>;
}
declare module '@parse/node-apn/lib/credentials/certificate/parse.js' {
  declare module.exports: $Exports<'@parse/node-apn/lib/credentials/certificate/parse'>;
}
declare module '@parse/node-apn/lib/credentials/certificate/parsePemCertificate.js' {
  declare module.exports: $Exports<'@parse/node-apn/lib/credentials/certificate/parsePemCertificate'>;
}
declare module '@parse/node-apn/lib/credentials/certificate/parsePemKey.js' {
  declare module.exports: $Exports<'@parse/node-apn/lib/credentials/certificate/parsePemKey'>;
}
declare module '@parse/node-apn/lib/credentials/certificate/parsePkcs12.js' {
  declare module.exports: $Exports<'@parse/node-apn/lib/credentials/certificate/parsePkcs12'>;
}
declare module '@parse/node-apn/lib/credentials/certificate/prepare.js' {
  declare module.exports: $Exports<'@parse/node-apn/lib/credentials/certificate/prepare'>;
}
declare module '@parse/node-apn/lib/credentials/certificate/validate.js' {
  declare module.exports: $Exports<'@parse/node-apn/lib/credentials/certificate/validate'>;
}
declare module '@parse/node-apn/lib/credentials/index' {
  declare module.exports: $Exports<'@parse/node-apn/lib/credentials'>;
}
declare module '@parse/node-apn/lib/credentials/index.js' {
  declare module.exports: $Exports<'@parse/node-apn/lib/credentials'>;
}
declare module '@parse/node-apn/lib/credentials/resolve.js' {
  declare module.exports: $Exports<'@parse/node-apn/lib/credentials/resolve'>;
}
declare module '@parse/node-apn/lib/credentials/token/prepare.js' {
  declare module.exports: $Exports<'@parse/node-apn/lib/credentials/token/prepare'>;
}
declare module '@parse/node-apn/lib/notification/apsProperties.js' {
  declare module.exports: $Exports<'@parse/node-apn/lib/notification/apsProperties'>;
}
declare module '@parse/node-apn/lib/notification/index' {
  declare module.exports: $Exports<'@parse/node-apn/lib/notification'>;
}
declare module '@parse/node-apn/lib/notification/index.js' {
  declare module.exports: $Exports<'@parse/node-apn/lib/notification'>;
}
declare module '@parse/node-apn/lib/protocol/endpoint.js' {
  declare module.exports: $Exports<'@parse/node-apn/lib/protocol/endpoint'>;
}
declare module '@parse/node-apn/lib/protocol/endpointManager.js' {
  declare module.exports: $Exports<'@parse/node-apn/lib/protocol/endpointManager'>;
}
declare module '@parse/node-apn/lib/provider.js' {
  declare module.exports: $Exports<'@parse/node-apn/lib/provider'>;
}
declare module '@parse/node-apn/lib/token.js' {
  declare module.exports: $Exports<'@parse/node-apn/lib/token'>;
}
declare module '@parse/node-apn/lib/util/extend.js' {
  declare module.exports: $Exports<'@parse/node-apn/lib/util/extend'>;
}
declare module '@parse/node-apn/mock/client.js' {
  declare module.exports: $Exports<'@parse/node-apn/mock/client'>;
}
declare module '@parse/node-apn/mock/index' {
  declare module.exports: $Exports<'@parse/node-apn/mock'>;
}
declare module '@parse/node-apn/mock/index.js' {
  declare module.exports: $Exports<'@parse/node-apn/mock'>;
}
declare module '@parse/node-apn/test/client.js' {
  declare module.exports: $Exports<'@parse/node-apn/test/client'>;
}
declare module '@parse/node-apn/test/config.js' {
  declare module.exports: $Exports<'@parse/node-apn/test/config'>;
}
declare module '@parse/node-apn/test/credentials/ca/prepare.js' {
  declare module.exports: $Exports<'@parse/node-apn/test/credentials/ca/prepare'>;
}
declare module '@parse/node-apn/test/credentials/certificate/APNCertificate.js' {
  declare module.exports: $Exports<'@parse/node-apn/test/credentials/certificate/APNCertificate'>;
}
declare module '@parse/node-apn/test/credentials/certificate/APNKey.js' {
  declare module.exports: $Exports<'@parse/node-apn/test/credentials/certificate/APNKey'>;
}
declare module '@parse/node-apn/test/credentials/certificate/load.js' {
  declare module.exports: $Exports<'@parse/node-apn/test/credentials/certificate/load'>;
}
declare module '@parse/node-apn/test/credentials/certificate/parse.js' {
  declare module.exports: $Exports<'@parse/node-apn/test/credentials/certificate/parse'>;
}
declare module '@parse/node-apn/test/credentials/certificate/parsePemCertificate.js' {
  declare module.exports: $Exports<'@parse/node-apn/test/credentials/certificate/parsePemCertificate'>;
}
declare module '@parse/node-apn/test/credentials/certificate/parsePemKey.js' {
  declare module.exports: $Exports<'@parse/node-apn/test/credentials/certificate/parsePemKey'>;
}
declare module '@parse/node-apn/test/credentials/certificate/parsePkcs12.js' {
  declare module.exports: $Exports<'@parse/node-apn/test/credentials/certificate/parsePkcs12'>;
}
declare module '@parse/node-apn/test/credentials/certificate/prepare.js' {
  declare module.exports: $Exports<'@parse/node-apn/test/credentials/certificate/prepare'>;
}
declare module '@parse/node-apn/test/credentials/certificate/validate.js' {
  declare module.exports: $Exports<'@parse/node-apn/test/credentials/certificate/validate'>;
}
declare module '@parse/node-apn/test/credentials/resolve.js' {
  declare module.exports: $Exports<'@parse/node-apn/test/credentials/resolve'>;
}
declare module '@parse/node-apn/test/credentials/token/prepare.js' {
  declare module.exports: $Exports<'@parse/node-apn/test/credentials/token/prepare'>;
}
declare module '@parse/node-apn/test/notification/apsProperties.js' {
  declare module.exports: $Exports<'@parse/node-apn/test/notification/apsProperties'>;
}
declare module '@parse/node-apn/test/notification/index' {
  declare module.exports: $Exports<'@parse/node-apn/test/notification'>;
}
declare module '@parse/node-apn/test/notification/index.js' {
  declare module.exports: $Exports<'@parse/node-apn/test/notification'>;
}
declare module '@parse/node-apn/test/protocol/endpoint.js' {
  declare module.exports: $Exports<'@parse/node-apn/test/protocol/endpoint'>;
}
declare module '@parse/node-apn/test/protocol/endpointManager.js' {
  declare module.exports: $Exports<'@parse/node-apn/test/protocol/endpointManager'>;
}
declare module '@parse/node-apn/test/provider.js' {
  declare module.exports: $Exports<'@parse/node-apn/test/provider'>;
}
declare module '@parse/node-apn/test/support.js' {
  declare module.exports: $Exports<'@parse/node-apn/test/support'>;
}
declare module '@parse/node-apn/test/token.js' {
  declare module.exports: $Exports<'@parse/node-apn/test/token'>;
}
