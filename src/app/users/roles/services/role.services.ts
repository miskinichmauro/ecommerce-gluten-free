import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Role } from '../interfaces/role.interface';

const baseUrlRoles = `${environment.baseUrl}/roles`;

const emptyRole: Role = {
  id: 'new',
  name: '',
  description: ''
};

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly http = inject(HttpClient);
  private readonly rolesCache = new Map<string, Role>();

  getAll(): Observable<Role[]> {
    if (this.rolesCache.size) {
      return of(Array.from(this.rolesCache.values()));
    }

    return this.http.get<Role[]>(baseUrlRoles).pipe(
      tap((resp) => resp.forEach((role) => this.rolesCache.set(role.id, role)))
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
      tap((resp) => this.rolesCache.set(id, resp))
    );
  }

  create(role: Partial<Role>): Observable<Role> {
    return this.http.post<Role>(baseUrlRoles, role).pipe(
      tap((res) => this.insertOrUpdateCache(res))
    );
  }

  update(id: string, partialRole: Partial<Role>): Observable<Role> {
    return this.http.patch<Role>(`${baseUrlRoles}/${id}`, partialRole).pipe(
      tap((resp) => this.insertOrUpdateCache(resp))
    );
  }

  delete(id: string): Observable<Role> {
    return this.http.delete<Role>(`${baseUrlRoles}/${id}`).pipe(
      tap(() => this.rolesCache.delete(id))
    );
  }

  private insertOrUpdateCache(role: Role) {
    this.rolesCache.set(role.id, role);
  }
}
