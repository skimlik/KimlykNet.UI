import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DOCUMENT, inject, Injectable, signal } from '@angular/core';
import { AuthToken } from './auth-token';
import { API_URL } from 'src/app/app.config';
import { catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _authenticated = signal(false);
  private _token = signal<AuthToken | undefined>(undefined);

  private _apiUrl = inject(API_URL);
  private _http = inject(HttpClient);
  private _document = inject(DOCUMENT);

  constructor() {
    this._authenticated.set(this.sessionActive);
  }

  authenticated = this._authenticated.asReadonly();

  authenticate(user: string, password: string): void {
    this._http
      .post<AuthToken>(`${this._apiUrl}/api/auth/token`, {
        userEmail: user,
        password,
        clientId: 'https://kimlyknet.dev.local',
      })
      .pipe(
        catchError((error) => {
          console.error('Authentication failed:', error);
          return of(undefined);
        }),
      )
      .subscribe((token) => {
        if (token) {
          this._token.set(token);
          this._authenticated.set(true);
          this.defaultView.localStorage.setItem('auth_token', token.token);
          this.defaultView.localStorage.setItem('auth_token_expiration', token.expiration);
        }
      });
  }

  get authHeader(): HttpHeaders {
    const token = this.token;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return headers;
  }

  get token(): string | null {
    return this.defaultView.localStorage.getItem('auth_token');
  }

  logOff(): void {
    this.defaultView.localStorage.removeItem('auth_token');
    this.defaultView.localStorage.removeItem('auth_token_expiration');
    this._authenticated.set(false);
  }

  private get sessionActive(): boolean {
    const expiration = this.defaultView.localStorage.getItem('auth_token_expiration');
    if (expiration && Date.parse(expiration).valueOf() > new Date().valueOf()) {
      return !!this.defaultView.localStorage.getItem('auth_token');
    }
    return false;
  }

  private get defaultView(): Window {
    return this._document.defaultView ?? window;
  }
}
