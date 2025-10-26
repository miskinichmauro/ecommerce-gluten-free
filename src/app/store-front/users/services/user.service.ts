import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ToastService } from '@shared/services/toast.service';
import { User } from '@store-front/users/interfaces/user.interfase';
import { finalize, Observable, of, tap } from 'rxjs';
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
  private readonly toastService = inject(ToastService);

  getAll(): Observable<User[]> {
    if (this.usersCache.size) {
      return of(Array.from(this.usersCache.values()));
    }

    return this.http.get<User[]>(baseUrlUsers).pipe(
      tap((res) => res.forEach((user) => this.usersCache.set(user.id, user)))
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
      tap((res) => this.usersCache.set(id, res))
    );
  }

  create(user: Partial<User>): Observable<User> {
    this.toastService.activateLoading();
    return this.http.post<User>(baseUrlUsers, user).pipe(
      tap((res) => {
        this.insertOrUpdateCache(res);
        this.toastService.activateSuccess();
      }),
      finalize(() => this.toastService.deactivateLoading())
    );
  }

  update(id: string, partialUser: Partial<User>): Observable<User> {
    this.toastService.activateLoading();
    return this.http.patch<User>(`${baseUrlUsers}/${id}`, partialUser).pipe(
      tap((res) => {
        this.insertOrUpdateCache(res);
        this.toastService.activateSuccess();
      }),
      finalize(() => this.toastService.deactivateLoading())
    );
  }

  delete(id: string): Observable<User> {
    this.toastService.activateLoading();
    return this.http.delete<User>(`${baseUrlUsers}/${id}`).pipe(
      tap(async () => {
        this.usersCache.delete(id);
        this.toastService.activateSuccess();
      }),
      finalize(() => this.toastService.deactivateLoading())
    );
  }

  private insertOrUpdateCache(user: User) {
    this.usersCache.set(user.id, user);
  }
}
