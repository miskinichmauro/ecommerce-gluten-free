import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment';

const baseUrl = environment.baseUrl.replace(/\/$/, '');
const FALLBACK_IMAGE = 'assets/images/default-image.jpg';

type ImageLike = string | { url?: string; secureUrl?: string; path?: string; id?: string; name?: string; fileName?: string; filename?: string };

@Pipe({
  name: 'productImage',
  standalone: true,
})
export class ProductImagePipe implements PipeTransform {
  transform(value: ImageLike | ImageLike[] | null | undefined): string {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return FALLBACK_IMAGE;
    }

    const candidates = Array.isArray(value) ? value : [value];
    const resolved = this.resolveFirst(candidates);

    if (!resolved) {
      return FALLBACK_IMAGE;
    }

    if (resolved.startsWith('assets/')) {
      return resolved;
    }

    if (/^(https?:)?\/\//.test(resolved) || resolved.startsWith('data:') || resolved.startsWith('blob:')) {
      return resolved;
    }

    if (resolved.startsWith('/')) {
      return `${baseUrl}${resolved}`;
    }

    const encoded = encodeURIComponent(resolved);
    return `${baseUrl}/files/products/${encoded}`;
  }

  private resolveFirst(values: ImageLike[]): string | null {
    for (const value of values) {
      const candidate = this.resolveImageValue(value);
      if (candidate !== null && candidate !== undefined) {
        const str = typeof candidate === 'string' ? candidate : String(candidate);
        const trimmed = str.trim();
        if (trimmed) return trimmed;
      }
    }
    return null;
  }

  private resolveImageValue(value: ImageLike | null | undefined): string | null {
    if (!value) return null;
    if (typeof value === 'string') {
      return value;
    }

    return (
      value.secureUrl ||
      value.url ||
      value.path ||
      value.fileName ||
      value.filename ||
      value.name ||
      value.id ||
      null
    );
  }
}
