import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment';

const baseUrl = environment.baseUrl;
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

    const raw = Array.isArray(value) ? value[0] : value;
    const resolved = this.resolveImageValue(raw);

    if (!resolved) {
      return FALLBACK_IMAGE;
    }

    if (resolved.startsWith('assets/')) {
      return resolved;
    }

    if (/^https?:\/\//.test(resolved)) {
      return resolved;
    }

    return `${baseUrl}/files/product/${resolved}`;
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
