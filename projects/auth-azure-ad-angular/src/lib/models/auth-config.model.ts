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

  // if you need to check multiple api's for policies and if the UI is authorized to access them
  // url: string of the policy endpoint
  // required: when true, one 401/403 from the policy endpoint will logout the user
  /*authorization: {
    url: string;
    required: boolean;
  } []*/
  // removed array as server side config in azure does not support arrays (yet)
  authorization: {
    url: string;
    required: boolean;
  }

}
