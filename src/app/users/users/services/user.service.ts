import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { User } from 'src/app/users/users/interfaces/user.interfase';
import { environment } from 'src/environments/environment';

const baseUrlUsers = `${environment.baseUrl}/users`;

const emptyUser: User = {
  id: 'new',
  email: '',
  fullName: '',
  roles: [],
  deletedAt: null
};

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly usersCache = new Map<string, User>();

  getAll(): Observable<User[]> {
    if (this.usersCache.size) {
      return of(Array.from(this.usersCache.values()));
    }

    return this.http.get<User[]>(baseUrlUsers).pipe(
      tap((resp) => resp.forEach((user) => this.usersCache.set(user.id, user)))
    );
  }

  getById(id: string): Observable<User> {
    if (id === 'new') {
      return of(emptyUser);
    }

    if (this.usersCache.has(id)) {
      return of(this.usersCache.get(id)!);
    }

    return this.http.get<User>(`${baseUrlUsers}/${id}`).pipe(
      tap((resp) => this.usersCache.set(id, resp))
    );
  }

  create(user: Partial<User>): Observable<User> {
    return this.http.post<User>(baseUrlUsers, user).pipe(
      tap((res) => this.insertOrUpdateCache(res))
    );
  }

  update(id: string, partialUser: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${baseUrlUsers}/${id}`, partialUser).pipe(
      tap((resp) => this.insertOrUpdateCache(resp))
    );
  }

  delete(id: string): Observable<User> {
    return this.http.delete<User>(`${baseUrlUsers}/${id}`).pipe(
      tap(() => this.usersCache.delete(id))
    );
  }

  private insertOrUpdateCache(user: User) {
    this.usersCache.set(user.id, user);
  }
}
