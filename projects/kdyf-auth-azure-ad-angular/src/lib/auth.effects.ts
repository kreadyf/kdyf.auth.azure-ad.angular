// ANGULAR
import {Router} from '@angular/router';
import {Injectable} from '@angular/core';
// RXJS
import {of} from 'rxjs';
import {Store} from '@ngrx/store';
import {exhaustMap, map, catchError, withLatestFrom} from 'rxjs/operators';
// NGRX
import * as authActions from './auth.actions';
import {Actions, createEffect, ofType} from '@ngrx/effects';
// SERVICES
import {AuthService} from './services/auth.service';
// OTHERS
import {GrantType} from './models/auth-grant-type.enum';

@Injectable()
export class AuthEffects {

  constructor(private router: Router,
              private store: Store<any>,
              private actions$: Actions,
              private authAzureAdService: AuthService) {
  }

  login$ = createEffect(() => this.actions$.pipe(
    ofType(authActions.Login.type),
    map((action: any) => action),
    exhaustMap((param: {
      grantType: GrantType.AZUREAD,
      credentials: any,
      keepLoggedIn: boolean
    }) => this.authAzureAdService.login(param.grantType, param.credentials).pipe(
      map(success => authActions.AuthenticationSuccess(success)),
      catchError(error => of(authActions.AuthenticationFailure(error)))
    ))
    )
  );

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
          ? this.authAzureAdService.checkAndUpdateAuthorization().pipe(
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
      this.authAzureAdService.refreshToken({refreshToken: action.refreshToken}).pipe(
        map(success => authActions.AuthenticationSuccess(success)),
        catchError(error => of(authActions.AuthenticationFailure(error)))
      ))
    )
  );

  azureAdInitLogin$ = createEffect(() => this.actions$.pipe(
    ofType(authActions.AzureAdInitLogin.type),
    exhaustMap(() => of(this.authAzureAdService.initAzureAd()))
    ),
    {dispatch: false}
  );

}
