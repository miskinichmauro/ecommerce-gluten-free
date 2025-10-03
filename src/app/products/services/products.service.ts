import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Product, ProductResponse } from '../interfaces/product';
import { Observable, of, tap, map } from 'rxjs';
import { environment } from 'src/environments/environment';

const baseUrlProducts = `${environment.baseUrl}/products`;

interface Options {
  limit? : number;
  offset? : number;
  isFeatured?: boolean;
}

@Injectable({providedIn: 'root'})
export class ProductService {
  constructor() { }
  private readonly http = inject(HttpClient);
  private readonly productsCache = new Map<string, ProductResponse>();
  private readonly productCache = new Map<string, Product>();

  getProducts(options: Options = {}): Observable<ProductResponse> {
    const { limit = 12, offset = 0, isFeatured = false } = options;

    const cacheKey = isFeatured
      ? 'isFeatured'
      : `${limit}-${offset}`;

    if (this.productsCache.has(cacheKey)) {
      return of(this.productsCache.get(cacheKey)!)
    }

    const response = this.http.get<ProductResponse>(baseUrlProducts, {
      params: {
        limit,
        offset,
        isFeatured
      },
      responseType: 'json'
    })
    .pipe(
        tap((res) => this.productsCache.set(cacheKey, res))
    );
    return response;
  }

  getProductByIdSlug(idSlug: string): Observable<Product> {

    if ( this.productCache.has(idSlug)) {
      return of(this.productCache.get(idSlug)!)
    }

    const response = this.http.get<Product>(`${baseUrlProducts}/${idSlug}`, {
      responseType: 'json'
    })
    .pipe(
        tap((res) => this.productCache.set(idSlug, res))
    );
    return response;
  }

  updateProduct(id:string, partialProduct: Partial<Product>): Observable<Product> {
    const response = this.http.patch<Product>(`${baseUrlProducts}/${id}`, partialProduct)
    .pipe(
        tap((res) => this.updateProductCache(res))
    );
    return response;
  }

  updateProductCache(product: Product) {
    const productId = product.id;
    this.productCache.set(productId, product);
    this.productsCache.forEach(productResponse => {
      productResponse.products = productResponse.products.map(
        currentProduct => {
          return currentProduct.id ===productId ? product : currentProduct;
        }
      )
    })
  }
}
