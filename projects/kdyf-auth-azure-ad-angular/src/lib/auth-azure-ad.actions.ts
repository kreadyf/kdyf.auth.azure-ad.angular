import {createAction, props} from '@ngrx/store';
import {
  User,
  AuthenticateResponse,
  AuthenticateByAzureAdToken,
  AuthenticateByRefreshToken
} from './models/auth.models';
import {GrantType} from './models/auth.grant-type.enum';

export const Login = createAction(
  '[AUTH]Login',
  props<{
    grantType: GrantType,
    credentials: AuthenticateByAzureAdToken,
    keepLoggedIn: boolean
  }>()
);

export const AuthenticationSuccess = createAction(
  '[AUTH]AuthenticationSuccess',
  props<{ user: User, authenticate: AuthenticateResponse }>()
);
export const AuthenticationFailure = createAction(
  '[AUTH]AuthenticationFailure',
  props<{ validation: string }>()
);

export const Logout = createAction('[AUTHAzureAd]Logout');
export const Authorize = createAction('[AUTHAzureAd]Authorize', props<{ authToken: string }>());
export const LoginRedirect = createAction('[AUTHAzureAd]LoginRedirect', props<{ urlRedirect: string }>());
export const RefreshToken = createAction('[AUTHAzure]RefreshToken', props<AuthenticateByRefreshToken>());

export const AuthorizationSuccess = createAction('[AUTHAzureAd]AuthorizationSuccess', props<{ policies: string[] }>());
export const AuthorizationFailure = createAction('[AUTHAzureAd]AuthorizationFailure', props<{ error: string }>());

export const RequestAuthenticationFailure = createAction('[AUTHAzureAd]RequestAuthenticationFailure');
export const RequestAuthorizationFailure = createAction('[AUTHAzureAd]RequestAuthorizationFailure');

export const AzureAdInitLogin = createAction('[Auth]AzureAdInitLogin', props<{ keepLoggedIn: boolean }>());
