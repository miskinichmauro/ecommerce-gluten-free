import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { finalize, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Role } from '../interfaces/role.interface';
import { ToastService } from '@shared/services/toast.service';

const baseUrlRoles = `${environment.baseUrl}/roles`;

const emptyRole: Role = {
  id: 'new',
  name: '',
  description: ''
};

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);
  private readonly rolesCache = new Map<string, Role>();

  getAll(): Observable<Role[]> {
    if (this.rolesCache.size) {
      return of(Array.from(this.rolesCache.values()));
    }

    return this.http.get<Role[]>(baseUrlRoles).pipe(
      tap((res) => res.forEach((role) => this.rolesCache.set(role.id, role)))
    );
  }

  getById(id: string): Observable<Role> {
    if (id === 'new') {
      return of(emptyRole);
    }

    if (this.rolesCache.has(id)) {
      return of(this.rolesCache.get(id)!);
    }

    return this.http.get<Role>(`${baseUrlRoles}/${id}`).pipe(
      tap((res) => this.rolesCache.set(id, res))
    );
  }

  create(role: Partial<Role>): Observable<Role> {
    this.toastService.activateLoading();
    return this.http.post<Role>(baseUrlRoles, role).pipe(
      tap((res) => {
        this.insertOrUpdateCache(res);
        this.toastService.activateSuccess();
      }),
      finalize(() => this.toastService.deactivateLoading())
    );
  }

  update(id: string, partialRole: Partial<Role>): Observable<Role> {
    this.toastService.activateLoading();
    return this.http.patch<Role>(`${baseUrlRoles}/${id}`, partialRole).pipe(
      tap((res) => {
        this.insertOrUpdateCache(res);
        this.toastService.activateSuccess();
      }),
      finalize(() => this.toastService.deactivateLoading())
    );
  }

  delete(id: string): Observable<Role> {
    this.toastService.activateLoading();
    return this.http.delete<Role>(`${baseUrlRoles}/${id}`).pipe(
      tap(async () => {
        this.rolesCache.delete(id);
        this.toastService.activateSuccess();
      }),
      finalize(() => this.toastService.deactivateLoading())
    );
  }

  private insertOrUpdateCache(role: Role) {
    this.rolesCache.set(role.id, role);
  }
}
