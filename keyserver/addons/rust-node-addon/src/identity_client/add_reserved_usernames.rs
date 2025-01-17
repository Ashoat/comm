use super::*;

#[napi]
#[instrument(skip_all)]
pub async fn add_reserved_usernames(
  message: String,
  signature: String,
) -> Result<()> {
  // Set up the gRPC client that will be used to talk to the Identity service
  let mut identity_client = get_identity_client_service_channel().await?;

  let add_reserved_usernames_request =
    AddReservedUsernamesRequest { message, signature };

  identity_client
    .add_reserved_usernames(add_reserved_usernames_request)
    .await
    .map_err(|e| Error::new(Status::GenericFailure, e.to_string()))?
    .into_inner();

  Ok(())
}
