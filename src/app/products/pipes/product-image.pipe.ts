import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment';

const baseUrl = environment.baseUrl;
const FALLBACK_IMAGE = 'assets/images/default-image.jpg';

@Pipe({
  name: 'productImage',
  standalone: true
})
export class ProductImagePipe implements PipeTransform {
  transform(value: string | string[] | null | undefined): string {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return FALLBACK_IMAGE;
    }

    const rawImage = Array.isArray(value) ? value[0] : value;
    if (!rawImage) return FALLBACK_IMAGE;

    if (/^https?:\/\//.test(rawImage)) {
      return rawImage;
    }

    return `${baseUrl}/files/product/${rawImage}`;
  }
}
