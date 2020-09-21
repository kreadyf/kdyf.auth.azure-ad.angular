// NGRX
import {AuthState} from './auth.reducer';
import {ActionReducer, MetaReducer} from '@ngrx/store';
import {localStorageSync} from 'ngrx-store-localstorage';

export function sessionStorageSyncReducer(reducer: ActionReducer<AuthState>): ActionReducer<AuthState> {

  const keepLoggedIn: boolean = sessionStorage.getItem('keepLoggedIn') === 'true';
  const sessionStorageInUse = sessionStorage.getItem('authenticate') != null;
  const localStorageInUse = localStorage.getItem('authenticate') != null;

  const useLocalStorage = keepLoggedIn || (!sessionStorageInUse && localStorageInUse);

  if (useLocalStorage === true) {
    return localStorageSync({
      keys: ['user', 'urlRedirect'],
      rehydrate: true,
      storage: localStorage,
      removeOnUndefined: true
    })(reducer);
  } else {
    return localStorageSync({
      keys: ['user', 'urlRedirect'],
      rehydrate: true,
      storage: localStorage,
      removeOnUndefined: true
    })(reducer);
  }

}

export const metaReducers: MetaReducer<AuthState>[] = [sessionStorageSyncReducer];
