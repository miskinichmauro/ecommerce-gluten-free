import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Rol } from '../interfaces/rol.interface';

const baseUrlRoles = `${environment.baseUrl}/roles`;

const emptyRol: Rol = {
  id: 'new',
  name: '',
};

@Injectable({ providedIn: 'root' })
export class RolService {
  private readonly http = inject(HttpClient);
  private readonly rolesCache = new Map<string, Rol>();

  getAll(): Observable<Rol[]> {
    if (this.rolesCache.size) {
      return of(Array.from(this.rolesCache.values()));
    }

    return this.http.get<Rol[]>(baseUrlRoles).pipe(
      tap((resp) => resp.forEach((rol) => this.rolesCache.set(rol.id, rol)))
    );
  }

  getById(id: string): Observable<Rol> {
    if (id === 'new') {
      return of(emptyRol);
    }

    if (this.rolesCache.has(id)) {
      return of(this.rolesCache.get(id)!);
    }

    return this.http.get<Rol>(`${baseUrlRoles}/${id}`).pipe(
      tap((resp) => this.rolesCache.set(id, resp))
    );
  }

  create(rol: Partial<Rol>): Observable<Rol> {
    return this.http.post<Rol>(baseUrlRoles, rol).pipe(
      tap((res) => this.insertOrUpdateCache(res))
    );
  }

  update(id: string, partialRol: Partial<Rol>): Observable<Rol> {
    return this.http.patch<Rol>(`${baseUrlRoles}/${id}`, partialRol).pipe(
      tap((resp) => this.insertOrUpdateCache(resp))
    );
  }

  delete(id: string): Observable<Rol> {
    return this.http.delete<Rol>(`${baseUrlRoles}/${id}`).pipe(
      tap(() => this.rolesCache.delete(id))
    );
  }

  private insertOrUpdateCache(rol: Rol) {
    this.rolesCache.set(rol.id, rol);
  }
}
