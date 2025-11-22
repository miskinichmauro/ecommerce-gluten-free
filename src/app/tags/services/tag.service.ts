import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { finalize, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Tag } from '../interfaces/tag.interface';
import { ToastService } from '@shared/services/toast.service';

const baseUrlTags = `${environment.baseUrl}/tags`;

const emptyTag: Tag = {
  id: 'new',
  name: '',
};

@Injectable({ providedIn: 'root' })
export class TagService {
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);
  private readonly tagsCache = new Map<string, Tag[]>();

  getAll(categoryId?: string): Observable<Tag[]> {
    const key = categoryId ?? 'all';
    if (this.tagsCache.has(key)) {
      return of(this.tagsCache.get(key)!);
    }

    return this.http.get<Tag[]>(baseUrlTags, {
      params: categoryId ? { categoryId } : undefined,
      responseType: 'json',
    }).pipe(
      tap(res => this.tagsCache.set(key, res))
    );
  }

  getById(id: string): Observable<Tag> {
    if (id === 'new') {
      return of(emptyTag);
    }

    // no per-category cache here, just fetch directly
    return this.http.get<Tag>(`${baseUrlTags}/${id}`).pipe(
      tap(res => {
        this.tagsCache.clear(); // invalidate caches to keep consistency
        this.tagsCache.set(res.id, [res]);
      })
    );
  }

  create(tag: Partial<Tag>): Observable<Tag> {
    this.toastService.activateLoading();
    return this.http.post<Tag>(baseUrlTags, tag).pipe(
      tap(res => {
        this.tagsCache.clear();
        this.toastService.activateSuccess();
      }),
      finalize(() => this.toastService.deactivateLoading())
    );
  }

  update(id: string, partialTag: Partial<Tag>): Observable<Tag> {
    this.toastService.activateLoading();
    return this.http.patch<Tag>(`${baseUrlTags}/${id}`, partialTag).pipe(
      tap(res => {
        this.tagsCache.clear();
        this.toastService.activateSuccess();
      }),
      finalize(() => this.toastService.deactivateLoading())
    );
  }

  delete(id: string): Observable<Tag> {
    this.toastService.activateLoading();
    return this.http.delete<Tag>(`${baseUrlTags}/${id}`).pipe(
      tap(() => {
        this.tagsCache.clear();
        this.toastService.activateSuccess();
      }),
      finalize(() => this.toastService.deactivateLoading())
    );
  }
}
