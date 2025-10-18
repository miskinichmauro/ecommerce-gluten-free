import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Product, ProductResponse } from '../interfaces/product';
import { Observable, of, tap, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from 'src/app/users/users/interfaces/user.interfase';

const baseUrlProducts = `${environment.baseUrl}/products`;

interface Options {
  limit? : number;
  offset? : number;
  isFeatured?: boolean;
}

const emptyProduct: Product = {
  id: 'new',
  title: '',
  price: 0,
  unitOfMeasure: '',
  description: '',
  slug: '',
  stock: 0,
  tags: [''],
  deleteAt: null,
  imagesName: [''],
  user: {} as User
}

@Injectable({providedIn: 'root'})
export class ProductService {
  constructor() { }
  private readonly http = inject(HttpClient);
  private readonly productsCache = new Map<string, ProductResponse>();
  private readonly productCache = new Map<string, Product>();

  getProducts(options: Options = {}): Observable<ProductResponse> {
    const limitEnvironment = environment.cantProducts;
    const { limit = limitEnvironment, offset = 0, isFeatured = false } = options;

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
    if (idSlug === 'new') {
      return of(emptyProduct);
    }

    if (this.productCache.has(idSlug)) {
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

  createProduct(partialProduct: Partial<Product>): Observable<Product> {
    const response = this.http.post<Product>(`${baseUrlProducts}`, partialProduct)
    .pipe(tap((res) => this.insertOrUpdateCache(res)));
    return response;
  }

  updateProduct(id:string, partialProduct: Partial<Product>): Observable<Product> {
    const response = this.http.patch<Product>(`${baseUrlProducts}/${id}`, partialProduct)
    .pipe(
        tap((res) => this.insertOrUpdateCache(res))
    );
    return response;
  }

  insertOrUpdateCache(product: Product) {
    const existsProductCache = this.productCache.get(product.id);

    if (!existsProductCache) {
      this.productCache.set(product.id, product);
      this.productsCache.clear();
    } else {
      this.productCache.set(product.id, product);
      this.productsCache.forEach(productResponse => {
        productResponse.products = productResponse.products.map(
          currentProduct => {
            return currentProduct.id === product.id ? product : currentProduct;
          }
        )
      });
    }
  }
}
