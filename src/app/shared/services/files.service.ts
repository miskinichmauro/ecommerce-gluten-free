import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';

interface FileUploadResponse {
  id?: string;
  name?: string;
  fileName?: string;
  filename?: string;
  url?: string;
  secureUrl?: string;
  path?: string;
  files?: Array<{ id?: string; name?: string; fileName?: string; filename?: string; url?: string }>;
}

@Injectable({ providedIn: 'root' })
export class FilesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  uploadProductImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<FileUploadResponse | string | string[]>(`${this.baseUrl}/files/products/upload`, formData).pipe(
      map((res) => this.extractFileName(res))
    );
  }

  private extractFileName(res: FileUploadResponse | string | string[] | null): string {
    if (!res) return '';

    if (typeof res === 'string') {
      return this.normalizeFileName(res);
    }

    if (Array.isArray(res)) {
      const firstItem = res[0] as FileUploadResponse | string | undefined;
      if (!firstItem) return '';
      if (typeof firstItem === 'string') return this.normalizeFileName(firstItem);
      return this.normalizeFileName(firstItem.id || firstItem.fileName || firstItem.filename || firstItem.name || '');
    }

    if (res.files?.length) {
      const file = res.files[0];
      return this.normalizeFileName(file?.id || file?.fileName || file?.filename || file?.name || file?.url || '');
    }

    return this.normalizeFileName(res.id || res.fileName || res.filename || res.name || res.secureUrl || res.url || res.path || '');
  }

  private normalizeFileName(name: string) {
    if (!name) return '';
    if (/^https?:\/\//.test(name)) {
      const parts = name.split('/');
      return parts.at(-1) || name;
    }
    return name;
  }
}
