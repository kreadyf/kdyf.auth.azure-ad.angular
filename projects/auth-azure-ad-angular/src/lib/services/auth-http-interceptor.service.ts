// ANGULAR
import {Injectable} from '@angular/core';
import {HttpRequest, HttpEvent, HttpHandler} from '@angular/common/http';
import {HttpInterceptor, HttpErrorResponse, HttpResponse} from '@angular/common/http';
// RXJS
import {BehaviorSubject, Observable, throwError, timer} from 'rxjs';
import {catchError, finalize, withLatestFrom, exhaustMap, switchMap, tap} from 'rxjs/operators';
// NGRX
import {ofType} from '@ngrx/effects';
import {Store, ActionsSubject} from '@ngrx/store';
import * as authActions from '../auth.actions';
// SERVICES
import {AuthService} from './auth.service';

@Injectable()
export class AuthHttpInterceptor implements HttpInterceptor {

  isRefreshingToken = false;
  heartbeatSubs = new BehaviorSubject(null);

  constructor(private authService: AuthService,
              private store: Store<any>,
              private actions: ActionsSubject) {

    this.heartbeatSubs.pipe(
      switchMap(value => timer(30000)),
      tap(s => {
        const token = localStorage.getItem('authenticate') ? JSON.parse(localStorage.getItem('authenticate')).authToken : undefined;
        token ? this.store.dispatch(authActions.Authorize({authToken: token})) : '';
      })
    ).subscribe();

  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.heartbeatSubs.next(null);

    return next.handle(this.addToken(req)).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && (<HttpErrorResponse>error as HttpErrorResponse).status === 401) {
          return this.handle401Error(req, next);
        } else {
          return throwError(error);
        }
      }));

  }

  addToken(req: HttpRequest<any>): HttpRequest<any> {
    if (!localStorage.getItem('authenticate'))
      return req;
    return req.clone({setHeaders: {Authorization: 'Bearer ' + this.loadToken()}});
  }

  loadToken(): string {
    return JSON.parse(localStorage.getItem('authenticate')).authToken;
  }

  handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshingToken) {
      this.isRefreshingToken = true;
      this.store.dispatch(authActions.RequestAuthenticationFailure());
    }

    return this.actions.pipe(
      ofType(authActions.AuthenticationSuccess.type, authActions.AuthenticationFailure.type),
      withLatestFrom(this.store),
      exhaustMap(([action, storeState]) => {

        if ((<any>action).type === authActions.AuthenticationSuccess.type) {
          return next.handle(this.addToken(req));
        } else {
          return throwError(new HttpResponse({status: 401})); // check
        }
      }),
      finalize(() => {
        this.isRefreshingToken = false;
      }));
  }

}
