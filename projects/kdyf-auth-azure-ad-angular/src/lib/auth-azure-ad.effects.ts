// ANGULAR
import {Router} from '@angular/router';
import {Injectable} from '@angular/core';
// RXJS
import {of} from 'rxjs';
import {Store} from '@ngrx/store';
import {exhaustMap, map, catchError, withLatestFrom} from 'rxjs/operators';
// NGRX
import * as authActions from './auth-azure-ad.actions';
import {Actions, createEffect, ofType} from '@ngrx/effects';
// SERVICES
import {AuthService} from './services/auth.service';
// OTHERS
import {AuthenticateByLogin, AuthenticateBySamlToken} from './models/auth.models';
import {GrantType} from './models/auth.grant-type.enum';

@Injectable()
export class AuthAzureAdEffects {

  constructor(private router: Router,
              private store: Store<any>,
              private actions$: Actions,
              private service: AuthService) {
  }

  logout$ = createEffect(() => this.actions$.pipe(
    ofType(
      authActions.Logout.type,
      authActions.AuthenticationFailure.type,
      authActions.AuthorizationFailure.type
    ),
    withLatestFrom(this.store),
    map(([action, storeState]) => authActions.LoginRedirect({
      urlRedirect: this.router.url !== '/auth/login' ? this.router.url : storeState.auth.urlRedirect
    }))
    )
  );

  login$ = createEffect(() => this.actions$.pipe(
    ofType(authActions.Login.type),
    map((action: any) => action),
    exhaustMap((param: {
      grantType: GrantType,
      credentials: AuthenticateByLogin | AuthenticateBySamlToken,
      keepLoggedIn: boolean
    }) => this.service.login(param.grantType, param.credentials).pipe(
      map(success => authActions.AuthenticationSuccess(success)),
      catchError(error => of(authActions.AuthenticationFailure(error)))
    ))
    )
  );

  requestAuthenticationFailure$ = createEffect(() => this.actions$.pipe(
    ofType(authActions.RequestAuthenticationFailure.type),
    withLatestFrom(this.store),
    map(([action, storeState]) =>
      localStorage.getItem('authenticate') && (JSON.parse(localStorage.getItem('authenticate'))).refreshToken
        ? authActions.RefreshToken({refreshToken: (JSON.parse(localStorage.getItem('authenticate'))).refreshToken})
        : authActions.AuthenticationFailure({validation: 'no-refresh-token'})
    )
    )
  );

  authenticationSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(authActions.AuthenticationSuccess.type),
    map((action: any) => authActions.Authorize({authToken: action.authenticate.authToken})))
  );

  authorize$ = createEffect(() => this.actions$.pipe(
    ofType(authActions.Authorize.type),
    exhaustMap((action: any) => {
        return action.authToken
          ? this.service.checkAndUpdateAuthorization().pipe(
            map(policies => authActions.AuthorizationSuccess({policies: policies})),
            catchError(error => of(authActions.AuthorizationFailure({error: error}))))
          : of(authActions.AuthorizationSuccess({policies: []}));
      }
    )
    )
  );

  refreshToken$ = createEffect(() => this.actions$.pipe(
    ofType(authActions.RefreshToken.type),
    exhaustMap((action: any) =>
      this.service.refreshToken({refreshToken: action.refreshToken}).pipe(
        map(success => authActions.AuthenticationSuccess(success)),
        catchError(error => of(authActions.AuthenticationFailure(error)))
      ))
    )
  );

  samlInitLogin$ = createEffect(() => this.actions$.pipe(
    ofType(authActions.SamlInitLogin.type),
    exhaustMap((action: any) => of(this.service.initSaml()))
    )
    , {dispatch: false}
  );

  azureAdInitLogin$ = createEffect(() => this.actions$.pipe(
    ofType(authActions.AzureAdInitLogin.type),
    exhaustMap((action: any) => of(this.service.initAzureAd()))
    ),
    {dispatch: false}
  );

}
