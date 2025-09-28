import { computed, inject, Injectable, signal } from '@angular/core';
import { User } from './interfaces/user.interfase';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthResponse } from './interfaces/auth-response.interfase';
import { tap } from 'rxjs';

type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';
const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly _authStatus = signal<AuthStatus>('checking');
  private readonly _user = signal<User | null>(null);
  private readonly _token = signal<string | null>(null);

  private readonly http = inject(HttpClient);

  authStatus = computed<AuthStatus>(() => {
    if (this._authStatus() === 'checking') {
      return 'checking'
    }

    if (this._user()) {
      return 'authenticated';
    }

    return 'not-authenticated';
  });

  user = computed<User | null>(() => this._user());
  token = computed<string | null>(() => this._token());

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${baseUrl}/auth/login`, {
      email,
      password
    })
    .pipe(
      tap(resp => {
        this._user.set(resp.user);
        this._authStatus.set('authenticated');
        this._token.set(resp.access_token);

        localStorage.setItem('access_token', resp.access_token);
      })
    );
  }
}
