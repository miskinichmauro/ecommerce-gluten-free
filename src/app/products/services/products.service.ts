import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Product, ProductResponse } from '../interfaces/product';
import { Observable, of, tap, map, finalize } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastService } from '@shared/services/toast.service';
import { User } from '@store-front/users/interfaces/user.interfase';

const baseUrlProducts = `${environment.baseUrl}/products`;

const emptyProduct: Product = {
  id: 'new',
  title: '',
  price: 0,
  description: '',
  slug: '',
  stock: 0,
  tags: [],
  deleteAt: null,
  images: [],
  imageIds: [],
  user: {} as User
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor() {}
  private readonly http = inject(HttpClient);
  private readonly productsCache = new Map<string, ProductResponse>();
  private readonly productCache = new Map<string, Product>();
  private readonly toastService = inject(ToastService);

  getProducts(options: ProductOptions = {}): Observable<ProductResponse> {
    const limitEnvironment = environment.cantProducts;
    const { limit = limitEnvironment, offset = 0, isFeatured = false } = options;

    const cacheKey = isFeatured
      ? 'isFeatured'
      : `${limit}-${offset}`;

    if (this.productsCache.has(cacheKey)) {
      return of(this.productsCache.get(cacheKey)!);
    }

    const response = this.http
      .get<ProductResponse>(baseUrlProducts, {
        params: { limit, offset, isFeatured },
        responseType: 'json',
      })
      .pipe(tap((res) => this.productsCache.set(cacheKey, res)));

    return response;
  }

  searchProducts(options: ProductOptions = {}): Observable<ProductResponse> {
    const { query = '', limit = environment.cantProducts, offset = 0 } = options;

    return this.http.get<ProductResponse>(`${baseUrlProducts}/search`, {
      params: { query, limit, offset },
      responseType: 'json',
    });
  }

  getProductByIdSlug(idSlug: string): Observable<Product> {
    if (idSlug === 'new') {
      return of(emptyProduct);
    }

    if (this.productCache.has(idSlug)) {
      return of(this.productCache.get(idSlug)!);
    }

    const response = this.http
      .get<Product>(`${baseUrlProducts}/${idSlug}`, {
        responseType: 'json',
      })
      .pipe(tap((res) => this.productCache.set(idSlug, res)));
    return response;
  }

  createProduct(partialProduct: Partial<Product>): Observable<Product> {
    this.toastService.activateLoading();
    return this.http.post<Product>(`${baseUrlProducts}`, partialProduct).pipe(
      tap((res) => {
        this.insertOrUpdateCache(res);
        this.toastService.activateSuccess();
      }),
      finalize(() => this.toastService.deactivateLoading())
    );
  }

  updateProduct(id: string, partialProduct: Partial<Product>): Observable<Product> {
    this.toastService.activateLoading();
    return this.http.patch<Product>(`${baseUrlProducts}/${id}`, partialProduct).pipe(
      tap((res) => {
        this.insertOrUpdateCache(res);
        this.toastService.activateSuccess();
      }),
      finalize(() => this.toastService.deactivateLoading())
    );
  }

  insertOrUpdateCache(product: Product) {
    const existsProductCache = this.productCache.get(product.id);

    if (!existsProductCache) {
      this.productCache.set(product.id, product);
      this.productsCache.clear();
    } else {
      this.productCache.set(product.id, product);
      this.productsCache.forEach((productResponse) => {
        productResponse.products = productResponse.products.map((currentProduct) => {
          return currentProduct.id === product.id ? product : currentProduct;
        });
      });
    }
  }
}
