// NGRX
import {createAction, props} from '@ngrx/store';
// OTHERS
import {
  User,
  AuthenticateResponse,
  AuthenticateByAzureAdToken,
  AuthenticateByRefreshToken
} from './models/auth.models';

export const Login = createAction(
  '[AuthAzureAd]Login',
  props<{
    credentials: AuthenticateByAzureAdToken,
    keepLoggedIn: boolean
  }>()
);

export const AuthenticationSuccess = createAction(
  '[AuthAzureAd]AuthenticationSuccess',
  props<{ user: User, authenticate: AuthenticateResponse }>()
);
export const AuthenticationFailure = createAction(
  '[AuthAzureAd]AuthenticationFailure',
  props<{ validation: string }>()
);

export const Logout = createAction('[AuthAzureAd]Logout');
export const Authorize = createAction('[AuthAzureAd]Authorize', props<{ authToken: string }>());
export const LoginRedirect = createAction('[AuthAzureAd]LoginRedirect', props<{ urlRedirect: string }>());
export const RefreshToken = createAction('[AuthAzureAd]RefreshToken', props<AuthenticateByRefreshToken>());

export const AzureAdInitLogin = createAction('[AuthAzureAd]AzureAdInitLogin', props<{ keepLoggedIn: boolean }>());

export const AuthorizationSuccess = createAction('[AuthAzureAd]AuthorizationSuccess', props<{ policies: string[] }>());
export const AuthorizationFailure = createAction('[AuthAzureAd]AuthorizationFailure', props<{ error: string }>());

export const RequestAuthenticationFailure = createAction('[AuthAzureAd]RequestAuthenticationFailure');
export const RequestAuthorizationFailure = createAction('[AuthAzureAd]RequestAuthorizationFailure');
