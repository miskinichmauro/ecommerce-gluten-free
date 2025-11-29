import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ProductImageVariant, resolveProductImageValue } from '@shared/utils/product-image.utils';

const baseUrl = environment.baseUrl.replace(/\/$/, '');
const FALLBACK_IMAGE = 'assets/images/default-image.jpg';

type ImageLike = unknown;

@Pipe({
  name: 'productImage',
  standalone: true,
})
export class ProductImagePipe implements PipeTransform {
  transform(
    value: ImageLike | ImageLike[] | null | undefined,
    variant: ProductImageVariant = 'original'
  ): string {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return FALLBACK_IMAGE;
    }

    const candidates = Array.isArray(value) ? value : [value];
    const resolved = this.resolveFirst(candidates, variant);

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

  private resolveFirst(values: ImageLike[], variant: ProductImageVariant): string | null {
    for (const value of values) {
      const candidate = resolveProductImageValue(value, variant);
      if (candidate !== null && candidate !== undefined) {
        const str = typeof candidate === 'string' ? candidate : String(candidate);
        const trimmed = str.trim();
        if (trimmed) return trimmed;
      }
    }
    return null;
  }
}
