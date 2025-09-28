import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment';

const baseUrl= environment.baseUrl;

@Pipe({
  name: 'productImage'
})

export class ProductImagePipe implements PipeTransform {
  transform(value: string | string[]): string {
    if (typeof value === 'string') {
      return `${baseUrl}/files/product/${value}`;
    }

    const image = value[0];

    if (image) {
      return `${baseUrl}/files/product/${image}`;
    }

    return 'https://www.foodnavigator.com/resizer/v2/3MET5T7L4JO25FVOXQDQ67EHOE.jpg?auth=d16d65b4d7f1ff6620ee4d54a2abb29750e275e5721fcd954f2aecd5a78ab6f7&smart=true';
  }
}
