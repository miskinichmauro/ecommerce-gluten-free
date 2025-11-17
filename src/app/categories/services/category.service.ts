import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { finalize, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Category } from '../interfaces/category.interface';
import { ToastService } from '@shared/services/toast.service';

const baseUrlCategories = `${environment.baseUrl}/categories`;

const emptyCategory: Category = {
  id: 'new',
  name: '',
};

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);
  private readonly categoriesCache = new Map<string, Category>();

  getAll(): Observable<Category[]> {
    if (this.categoriesCache.size) {
      return of(Array.from(this.categoriesCache.values()));
    }

    return this.http.get<Category[]>(baseUrlCategories).pipe(
      tap(res => res.forEach(category => this.categoriesCache.set(category.id, category)))
    );
  }

  getById(id: string): Observable<Category> {
    if (id === 'new') {
      return of(emptyCategory);
    }

    if (this.categoriesCache.has(id)) {
      return of(this.categoriesCache.get(id)!);
    }

    return this.http.get<Category>(`${baseUrlCategories}/${id}`).pipe(
      tap(res => this.categoriesCache.set(id, res))
    );
  }

  create(category: Partial<Category>): Observable<Category> {
    this.toastService.activateLoading();
    return this.http.post<Category>(baseUrlCategories, category).pipe(
      tap(res => {
        this.insertOrUpdateCache(res);
        this.toastService.activateSuccess();
      }),
      finalize(() => this.toastService.deactivateLoading())
    );
  }

  update(id: string, partialCategory: Partial<Category>): Observable<Category> {
    this.toastService.activateLoading();
    return this.http.patch<Category>(`${baseUrlCategories}/${id}`, partialCategory).pipe(
      tap(res => {
        this.insertOrUpdateCache(res);
        this.toastService.activateSuccess();
      }),
      finalize(() => this.toastService.deactivateLoading())
    );
  }

  delete(id: string): Observable<Category> {
    this.toastService.activateLoading();
    return this.http.delete<Category>(`${baseUrlCategories}/${id}`).pipe(
      tap(() => {
        this.categoriesCache.delete(id);
        this.toastService.activateSuccess();
      }),
      finalize(() => this.toastService.deactivateLoading())
    );
  }

  private insertOrUpdateCache(category: Category) {
    this.categoriesCache.set(category.id, category);
  }
}
