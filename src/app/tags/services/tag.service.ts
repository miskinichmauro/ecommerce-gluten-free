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
  private readonly tagsCache = new Map<string, Tag>();

  getAll(): Observable<Tag[]> {
    if (this.tagsCache.size) {
      return of(Array.from(this.tagsCache.values()));
    }

    return this.http.get<Tag[]>(baseUrlTags).pipe(
      tap(res => res.forEach(tag => this.tagsCache.set(tag.id, tag)))
    );
  }

  getById(id: string): Observable<Tag> {
    if (id === 'new') {
      return of(emptyTag);
    }

    if (this.tagsCache.has(id)) {
      return of(this.tagsCache.get(id)!);
    }

    return this.http.get<Tag>(`${baseUrlTags}/${id}`).pipe(
      tap(res => this.tagsCache.set(id, res))
    );
  }

  create(tag: Partial<Tag>): Observable<Tag> {
    this.toastService.activateLoading();
    return this.http.post<Tag>(baseUrlTags, tag).pipe(
      tap(res => {
        this.insertOrUpdateCache(res);
        this.toastService.activateSuccess();
      }),
      finalize(() => this.toastService.deactivateLoading())
    );
  }

  update(id: string, partialTag: Partial<Tag>): Observable<Tag> {
    this.toastService.activateLoading();
    return this.http.patch<Tag>(`${baseUrlTags}/${id}`, partialTag).pipe(
      tap(res => {
        this.insertOrUpdateCache(res);
        this.toastService.activateSuccess();
      }),
      finalize(() => this.toastService.deactivateLoading())
    );
  }

  delete(id: string): Observable<Tag> {
    this.toastService.activateLoading();
    return this.http.delete<Tag>(`${baseUrlTags}/${id}`).pipe(
      tap(() => {
        this.tagsCache.delete(id);
        this.toastService.activateSuccess();
      }),
      finalize(() => this.toastService.deactivateLoading())
    );
  }

  private insertOrUpdateCache(tag: Tag) {
    this.tagsCache.set(tag.id, tag);
  }
}

