// NGRX
import * as authActions from './auth.actions';
import {Action, createReducer, on} from '@ngrx/store';
// OTHERS
import {User, AuthenticateResponse} from './models/auth.models';

export interface AuthState {
  user: User | undefined;
  authenticate: AuthenticateResponse | undefined;
  keepLoggedIn: boolean;

  pending: boolean;
  initializing: boolean;
  error: string | undefined;

  urlRedirect: string;
}

export const initialState: AuthState = {
  user: undefined,
  authenticate: undefined,
  keepLoggedIn: sessionStorage.getItem('keepLoggedIn') === 'true',
  pending: false,
  initializing: true,
  error: undefined,

  urlRedirect: undefined
};

const featureReducer = createReducer(
  initialState,
  on(authActions.Login, (state, {keepLoggedIn}) => ({
    ...state,
    keepLoggedIn: keepLoggedIn,
    pending: true,
    error: undefined
  })),
  on(authActions.SamlInitLogin, (state, {keepLoggedIn}) => ({
    ...state,
    keepLoggedIn: keepLoggedIn,
    pending: true,
    error: undefined
  })),
  on(authActions.AzureAdInitLogin, (state, {keepLoggedIn}) => ({
    ...state,
    keepLoggedIn: keepLoggedIn,
    pending: true,
    error: undefined
  })),
  on(authActions.RefreshToken, (state) => ({
    ...state,
    error: undefined,
    pending: true
  })),
  on(authActions.AuthenticationSuccess, (state, {authenticate, user}) => {
      localStorage.setItem('authenticate', JSON.stringify(authenticate));

      return {
        ...state,
        authenticate: authenticate,
        user: {
          ...user,
          policies: state.user ? state.user.policies : []
        },
        pending: false,
        error: undefined
      };
    }
  ),
  on(authActions.AuthenticationFailure, (state, {validation}) => {
    localStorage.removeItem('authenticate');

    return {
      ...state,
      error: validation,
      pending: false,
      user: undefined,
      authenticate: undefined
    };
  }),
  on(authActions.Authorize, (state) => ({
    ...state,
    pending: true,
    error: undefined
  })),
  on(authActions.AuthorizationSuccess, (state, {policies}) => ({
    ...state,
    pending: false,
    initializing: false,
    error: undefined,
    user: {
      ...state.user,
      policies: policies
    }
  })),
  on(authActions.AuthorizationFailure, (state, {error}) => ({
    ...state,
    pending: false,
    initializing: false,
    error: error
  })),
  on(authActions.Logout, (state) => {
    localStorage.removeItem('authenticate');

    return {
      ...state,
      error: undefined,
      pending: false,
      user: undefined,
      authenticate: undefined
    };
  }),
  on(authActions.LoginRedirect, (state, {urlRedirect}) => ({
    ...state,
    pending: false,
    initializing: false,
    urlRedirect: urlRedirect
  })),
);

export function reducer(state: AuthState | undefined, action: Action): any {
  return featureReducer(state, action);
}
