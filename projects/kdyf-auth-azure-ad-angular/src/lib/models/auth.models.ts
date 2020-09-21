export interface User {
  displayName: string;
  policies?: string[];
}

export interface AuthenticateByAzureAdToken {
  code: string;
}

export interface AuthenticateByRefreshToken {
  refreshToken: string;
}

export interface AuthenticateResponse {
  authToken: string;
  refreshToken: string;
}
