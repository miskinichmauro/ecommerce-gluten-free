import { computed, inject, Injectable, signal } from '@angular/core';
import { User } from './interfaces/user.interfase';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthResponse } from './interfaces/auth-response.interfase';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';
const baseUrlAuth = `${environment.baseUrl}/auth`;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly _authStatus = signal<AuthStatus>('checking');
  private readonly _user = signal<User | null>(null);
  private readonly _token = signal<string | null>(localStorage.getItem('access_token'));

  private readonly http = inject(HttpClient);

  checkStatusSignal = toSignal(this.checkStatus(), { initialValue: false });

  authStatus = computed<AuthStatus>(() => {
    if (this._authStatus() === 'checking') {
      return 'checking';
    }

    if (this._user()) {
      return 'authenticated';
    }

    return 'not-authenticated';
  });

  user = computed<User | null>(() => this._user());
  token = computed<string | null>(() => this._token());
  isAdmin = computed(() => this._user()?.roles.includes('admin') ?? false);

  login(email: string, password: string) : Observable<boolean> {
    return this.http.post<AuthResponse>(`${baseUrlAuth}/login`, {
      email,
      password
    })
    .pipe(
      map(resp => this.handleLoginSuccess(resp)),
      catchError(() => this.handleLoginError())
    );
  }

  register(email: string, password: string, fullName: string) : Observable<boolean> {
    return this.http.post<AuthResponse>(`${baseUrlAuth}/register`, {
      email,
      password,
      fullName
    })
    .pipe(
      map(resp => this.handleLoginSuccess(resp)),
      catchError((resp) => {
        return this.handleLoginError()})
    );
  }

  checkStatus() : Observable<boolean> {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      this.logout();
      return of(false);
    }
    return this.http.get<AuthResponse>(`${baseUrlAuth}/check-status`, {})
    .pipe(
      map(resp => this.handleLoginSuccess(resp)),
      catchError(() => this.handleLoginError())
    );
  }

  logout() {
    this._user.set(null);
    this._token.set(null);
    this._authStatus.set('not-authenticated');

    localStorage.removeItem('access_token');
  }

  private handleLoginSuccess(resp: AuthResponse) {
    this._user.set(resp.user);
    this._token.set(resp.access_token);
    this._authStatus.set('authenticated');

    localStorage.setItem('access_token', resp.access_token);
    return true;
  }

  private handleLoginError() {
    this.logout();
    return of(false);
  }
}
