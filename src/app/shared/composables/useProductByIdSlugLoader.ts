import { inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Product } from 'src/app/products/interfaces/product';
import { ProductService } from 'src/app/products/services/products.service';

export function useProductByIdSlugLoader() {
  const productService = inject(ProductService);

  const product = signal<Product | null>(null);
  const loading = signal<boolean>(true);
  const error = signal<string | null>(null);

  async function loadProducts(param: string) {
    loading.set(true);
    error.set(null);

    try {
      const data = await firstValueFrom(
        productService.getProductByIdSlug(param)
      );
      product.set(data);
    } catch (err) {
      console.error(err);
      error.set('Error al carga el producto');
    } finally {
      loading.set(false);
    }
  }

  return { product, loading, error, loadProducts };
}
