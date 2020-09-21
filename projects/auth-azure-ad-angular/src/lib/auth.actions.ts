import {createAction, props} from '@ngrx/store';
import {
  User,
  AuthenticateByLogin,
  AuthenticateResponse,
  AuthenticateBySamlToken,
  AuthenticateByAzureAdToken,
  AuthenticateByRefreshToken
} from './models/auth.models';
import {GrantType} from './models/auth.grant-type.enum';

export const Login = createAction(
  '[AUTH]Login',
  props<{
    grantType: GrantType,
    credentials: AuthenticateByLogin | AuthenticateBySamlToken | AuthenticateByAzureAdToken,
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

export const Logout = createAction('[AUTH]Logout');
export const Authorize = createAction('[AUTH]Authorize', props<{ authToken: string }>());
export const LoginRedirect = createAction('[AUTH]LoginRedirect', props<{ urlRedirect: string }>());
export const RefreshToken = createAction('[AUTH]RefreshToken', props<AuthenticateByRefreshToken>());

export const AuthorizationSuccess = createAction('[AUTH]AuthorizationSuccess', props<{ policies: string[] }>());
export const AuthorizationFailure = createAction('[AUTH]AuthorizationFailure', props<{ error: string }>());

export const RequestAuthenticationFailure = createAction('[AUTH]RequestAuthenticationFailure');
export const RequestAuthorizationFailure = createAction('[AUTH]RequestAuthorizationFailure');

export const SamlInitLogin = createAction('[AUTH]SamlInitLogin', props<{ keepLoggedIn: boolean }>());
export const AzureAdInitLogin = createAction('[Auth]AzureAdInitLogin', props<{ keepLoggedIn: boolean }>());
