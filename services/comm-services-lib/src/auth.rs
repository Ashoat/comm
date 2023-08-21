use base64::{prelude::BASE64_STANDARD, Engine};
use derive_more::{Display, Error, From};
use serde::{Deserialize, Serialize};
use std::{str::FromStr, string::FromUtf8Error};

/// This implements [`actix_web::FromRequest`], so it can be used to extract user
/// identity information from HTTP requests.
/// # Example
/// ```ignore
/// pub async fn request_handler(
///  user: UserIdentity,
/// ) -> Result<HttpResponse> {
///   Ok(HttpResponse::Ok().finish())
/// }
/// ```
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct UserIdentity {
  #[serde(rename = "userID")]
  pub user_id: String,
  #[serde(rename = "accessToken")]
  pub access_token: String,
  #[serde(rename = "deviceID")]
  pub device_id: String,
}

impl UserIdentity {
  /// Gets the access token value, usable in bearer authorization
  ///
  /// # Example
  /// ```ignore
  /// reqwest::get("url").beaerer_auth(user.as_authorization_token()?).send().await?;
  /// ```
  pub fn as_authorization_token(&self) -> Result<String, serde_json::Error> {
    let json = serde_json::to_string(self)?;
    let base64_str = BASE64_STANDARD.encode(json);
    Ok(base64_str)
  }
}

#[derive(Debug, Display, Error, From)]
pub enum UserIdentityParseError {
  Base64DecodeError(base64::DecodeError),
  Utf8DecodeError(FromUtf8Error),
  JsonParseError(serde_json::Error),
}

/// Parsing of [UserIdentity] from bearer token
impl FromStr for UserIdentity {
  type Err = UserIdentityParseError;

  fn from_str(s: &str) -> Result<Self, Self::Err> {
    let bytes = BASE64_STANDARD.decode(s)?;
    let text = String::from_utf8(bytes)?;
    let user = serde_json::from_str(&text)?;
    Ok(user)
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_user_identity_parsing() {
    let identity = UserIdentity {
      user_id: "user".to_string(),
      access_token: "token".to_string(),
      device_id: "device".to_string(),
    };
    let json =
      r#"{"userID": "user", "accessToken": "token", "deviceID": "device"}"#;
    let encoded = BASE64_STANDARD.encode(json);

    let parsed_identity = encoded.parse::<UserIdentity>();
    assert!(parsed_identity.is_ok(), "Parse error: {parsed_identity:?}");

    assert_eq!(parsed_identity.unwrap(), identity);
  }
}
