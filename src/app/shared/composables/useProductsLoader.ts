import { inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ProductResponse } from 'src/app/products/interfaces/product';
import { ProductService } from 'src/app/products/services/products.service';

export function useProductsLoader() {
  const productService = inject(ProductService);

  const productResponse = signal<ProductResponse | null>(null);
  const loading = signal<boolean>(true);
  const error = signal<string | null>(null);

  async function loadProducts(params: {
    offset?: number;
    limit?: number;
    isFeatured?: boolean;
    q?: string;
  }) {
    loading.set(true);
    error.set(null);

    try {
      const data = params.q
        ? await firstValueFrom(productService.searchProducts(params))
        : await firstValueFrom(productService.getProducts(params));

      productResponse.set(data);
    } catch (err) {
      error.set('Error al cargar los productos');
    } finally {
      loading.set(false);
    }
  }

  return { productResponse, loading, error, loadProducts };
}
