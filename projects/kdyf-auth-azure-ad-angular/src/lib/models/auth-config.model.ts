export class AuthConfig {
  loginHost: string;
  authType: string;
  clientId: string;
  clientSecret: string;
  samlInitUrl?: string;

  azureAdTenantId: string;
  azureAdClientId: string;
  azureAdRedirectUri: string;
  azureAdGrantType: string;
  azureAdClientSecret: string;

  response_type: string;
  state: string;
  redirect_uri: string;
  scope: string;
  urlCode: string;
  resource: string;

  session: boolean;

  authorization: {
    url: string;
    required: boolean;
  };

}
