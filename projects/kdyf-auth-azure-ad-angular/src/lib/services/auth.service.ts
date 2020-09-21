// ANGULAR
import {Injectable, Inject} from '@angular/core';
import {HttpClient, HttpParams, HttpHeaders, HttpParameterCodec} from '@angular/common/http';
// RXJS
import {map, catchError} from 'rxjs/operators';
import {Observable, of, throwError} from 'rxjs';
// NGRX
import {Store} from '@ngrx/store';
// MODULES
import {JwtHelperService} from '@auth0/angular-jwt';
// OTHERS
import {
  User,
  AuthenticateResponse,
  AuthenticateByRefreshToken,
  AuthenticateByAzureAdToken
} from '../models/auth.models';
import {AuthConfig} from '../models/auth-config.model';
import {GrantType} from '../models/auth-grant-type.enum';

const jwtHelper = new JwtHelperService();
const FORM_ENCODED_HTTP_HEADERS: HttpHeaders = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

export class CustomQueryEncoderHelper implements HttpParameterCodec {
  encodeKey(k: string): string {
    return encodeURIComponent(k);
  }

  encodeValue(v: string): string {
    return encodeURIComponent(v);
  }

  decodeKey(k: string): string {
    return decodeURIComponent(k);
  }

  decodeValue(v: string): string {
    return decodeURIComponent(v);
  }
}

@Injectable()
export class AuthService {

  constructor(private http: HttpClient, @Inject('authConfig') private config: AuthConfig, private store: Store<any>) {
  }

  initSaml(): void {
    document.location.href = `${this.config.loginHost}${this.config.samlInitUrl}`;
  }

  initAzureAd(): void {
    document.location.href = `${this.config.urlCode}response_type=${this.config.response_type}&state=${this.config.state}&client_id=${this.config.azureAdClientId}&redirect_uri=${this.config.azureAdRedirectUri}&scope=${this.config.scope}&prompt=select_account`;
  }

  login(grantType: GrantType, credentials: AuthenticateByAzureAdToken): Observable<{ user: User, authenticate: AuthenticateResponse }> {

    let body = new HttpParams({encoder: new CustomQueryEncoderHelper()});
    let loginHost = `${this.config.loginHost}/connect/token`;

    let azureAdCredentials = <AuthenticateByAzureAdToken>credentials;
    body = body
      .set('client_id', this.config.azureAdClientId)
      .set('client_secret', this.config.azureAdClientSecret)
      .set('grant_type', this.config.azureAdGrantType)
      .set('redirect_uri', this.config.azureAdRedirectUri)
      .set('code', azureAdCredentials.code);

    return this.http.post(`${this.config.loginHost}${this.config.azureAdTenantId}`, body, {headers: FORM_ENCODED_HTTP_HEADERS})
      .pipe<{ user: User, authenticate: AuthenticateResponse }>(
        map((data: any) => {
          return {
            user: this.parseToken(data.access_token),
            authenticate: {authToken: data.access_token, refreshToken: data.refresh_token}
          };
        })
      );
  }

  refreshToken(refreshToken: AuthenticateByRefreshToken): Observable<{ user: User, authenticate: AuthenticateResponse }> {
    if (!refreshToken || !refreshToken.refreshToken)
      return Observable.throw({user: null, authenticate: null});

    const body = new HttpParams()
      .set('client_id', this.config.azureAdClientId)
      .set('client_secret', this.config.azureAdClientSecret)
      .set('grant_type', 'refresh_token')
      .set('refresh_token', refreshToken.refreshToken)
      .set('scope', this.config.scope);

    return this.http.post(`${this.config.loginHost}${this.config.azureAdTenantId}`, body, {headers: FORM_ENCODED_HTTP_HEADERS})
      .pipe(
        map((data: any) => {
          return {
            user: this.parseToken(data.access_token),
            authenticate: {authToken: data.access_token, refreshToken: data.refresh_token}
          };
        })
      );
  }

  parseToken(token: string): User {
    var obj = jwtHelper.decodeToken(token);
    return {username: obj.unique_name, tenant: obj.tenant, displayName: obj.name};
  }


  /**Fork join for request array*/

  /*checkAndUpdateAuthorization(): Observable<string[]> {
    let authorizationEndpoints = this.config.authorization;
    if (!authorizationEndpoints)
      return of([]);
    return forkJoin(
      [authorizationEndpoints].map(
        authEndpoint => this.http.get(authEndpoint.url).pipe(map(res => res), catchError(err => authEndpoint.required ? throwError(err) : of([])))))
      .pipe(
        map(results => [].concat.apply([], results.filter(res => this.isArrayOfString(res))))
      );
  }*/

  /**only for one request*/
  checkAndUpdateAuthorization(): Observable<string[]> {
    let authorizationEndpoints = this.config.authorization;
    if (!authorizationEndpoints)
      return of([]);
    return this.http.get(authorizationEndpoints.url)
      .pipe(
        map((results: any) => results),
        catchError(err => authorizationEndpoints.required ? throwError(err) : of([]))
      );
  }

  isArrayOfString(value: any): boolean {
    return Array.isArray(value) && value.every(item => typeof item === 'string');
  }

}
