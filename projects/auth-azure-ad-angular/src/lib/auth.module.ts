// ANGULAR
import {CommonModule} from '@angular/common';
import {NgModule, ModuleWithProviders} from '@angular/core';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
// NGRX
import {reducer} from './auth.reducer';
import {StoreModule} from '@ngrx/store';
import {AuthEffects} from './auth.effects';
import {EffectsModule} from '@ngrx/effects';
import {metaReducers} from './auth.meta-reducer';
// SERVICES
import {AuthService} from './services/auth.service';
import {AuthGuard} from './services/auth-guard.service';
import {AuthHttpInterceptor} from './services/auth-http-interceptor.service';
// OTHERS
import {AuthConfig} from './models/auth-config.model';

export const storeModule = StoreModule.forFeature('auth', reducer, {metaReducers});
export const effectsModule = EffectsModule.forFeature([AuthEffects]);

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule
  ]
})

export class AuthModule {
  static forRoot(config: AuthConfig): ModuleWithProviders<any> {
    return {
      ngModule: RootAuthModule,
      providers: [
        AuthGuard,
        AuthService,
        {
          provide: 'authConfig',
          useValue: config
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthHttpInterceptor,
          multi: true
        }
      ]
    };
  }
}

@NgModule({
  imports: [
    AuthModule,
    storeModule,
    effectsModule
  ]
})

export class RootAuthModule {
}
