import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap, finalize, map, switchMap, forkJoin } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastService } from '@shared/services/toast.service';
import { CartItem } from 'src/app/carts/interfaces/cart-item';
import { Product } from 'src/app/products/interfaces/product';
import { AuthService } from '@auth/auth.service';

const baseUrlCart = `${environment.baseUrl}/cart`;

type CartItemsSource = CartItem[] | Record<string, unknown>;

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);
  private readonly cartCache = new Map<string, CartItem>();
  private readonly cartSubject = new BehaviorSubject<CartItem[]>([]);
  readonly cart$ = this.cartSubject.asObservable();

  constructor() {
    this.loadCart().subscribe();
  }

  loadCart(force = false): Observable<CartItem[]> {
    if (!force && this.cartCache.size > 0) {
      const items = Array.from(this.cartCache.values());
      this.cartSubject.next(items);
      return of(items);
    }
    if (this.auth.isAuthenticated()) {
      const guestItems = this.getCartFromLocalStorage();
      const hasGuest = guestItems.length > 0;

      const loadServer$ = this.http.get<CartItemsSource>(baseUrlCart).pipe(
        map(items => this.normalizeCartItems(items)),
        tap(items => this.updateCacheAndEmit(items))
      );

      if (hasGuest) {
        return this.syncGuestCartToServer(guestItems).pipe(
          switchMap(() => loadServer$)
        );
      }

      return loadServer$;
    } else {
      return of(this.getCartFromLocalStorage()).pipe(
        map(items => this.normalizeCartItems(items)),
        tap(items => this.updateCacheAndEmit(items))
      );
    }
  }

  addItem(product: Product, quantity = 1, options?: { showToast?: boolean }): Observable<CartItem | void> {
    const showToast = options?.showToast ?? true;
    const cartItem: CartItem = this.normalizeItem(
      {
        id: product.id,
        product,
        productId: product.id,
        quantity,
      },
      product,
      quantity
    );
    if (this.auth.isAuthenticated()) {
      // Optimistic append
      this.updateCacheAndEmit([...this.cartSubject.value, cartItem]);
      if (showToast) this.toast.activateLoading();
      return this.http.post<CartItem>(`${baseUrlCart}/items`, { productId: product.id, quantity }).pipe(
        tap(() => {
          this.loadCart(true).subscribe();
          if (showToast) this.toast.activateSuccess();
        }),
        finalize(() => showToast && this.toast.deactivateLoading())
      );
    } else {
      const localCart = this.getCartFromLocalStorage();
      const existing = localCart.find(i => i.productId === product.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        localCart.push(cartItem);
      }
      this.saveCartToLocalStorage(localCart);
      this.updateCacheAndEmit(localCart);
      return of(cartItem);
    }
  }

  updateItem(id: string, quantity: number): Observable<CartItem | void> {
    if (this.auth.isAuthenticated()) {
      this.toast.activateLoading();
      return this.http.patch<CartItem>(`${baseUrlCart}/items/${id}`, { quantity }).pipe(
        tap(item => {
          const normalized = this.normalizeItem(item, this.cartCache.get(id)?.product, quantity);
          this.cartCache.set(item.id, normalized);
          this.updateCacheAndEmit(Array.from(this.cartCache.values()));
          this.loadCart(true).subscribe();
          this.toast.activateSuccess();
        }),
        finalize(() => this.toast.deactivateLoading())
      );
    } else {
      const localCart = this.getCartFromLocalStorage().map(item =>
        item.id === id ? { ...item, quantity } : item
      );
      this.saveCartToLocalStorage(localCart);
      this.updateCacheAndEmit(localCart);
      return of();
    }
  }

  removeItem(id: string): Observable<void> {
    if (this.auth.isAuthenticated()) {
      this.toast.activateLoading();
      // Optimistic remove
      this.cartCache.delete(id);
      this.updateCacheAndEmit(Array.from(this.cartCache.values()));
      return this.http.delete<void>(`${baseUrlCart}/items/${id}`).pipe(
        tap(() => {
          this.loadCart(true).subscribe();
          this.toast.activateSuccess();
        }),
        finalize(() => this.toast.deactivateLoading())
      );
    } else {
      const localCart = this.getCartFromLocalStorage().filter(item => item.id !== id);
      this.saveCartToLocalStorage(localCart);
      this.updateCacheAndEmit(localCart);
      return of();
    }
  }

  getTotal(): number {
    const items = this.cartSubject.getValue();
    return items.reduce((acc, item) => acc + (item.product?.price ?? 0) * item.quantity, 0);
  }

  clearCart(options?: { delayMs?: number }): Observable<void> {
    const delayMs = options?.delayMs ?? 0;

    const resetAction = () => {
      this.resetCart();
      if (!this.auth.isAuthenticated()) {
        localStorage.removeItem('guestCart');
      }
    };

    if (delayMs > 0) {
      setTimeout(resetAction, delayMs);
    } else {
      resetAction();
    }

    if (this.auth.isAuthenticated()) {
      return this.http.delete<void>(baseUrlCart).pipe(
        tap(() => {}),
        finalize(() => {})
      );
    } else {
      return of();
    }
  }

  private getCartFromLocalStorage(): CartItem[] {
    const raw = localStorage.getItem('guestCart');
    return raw ? JSON.parse(raw) : [];
  }

  private saveCartToLocalStorage(items: CartItem[]): void {
    localStorage.setItem('guestCart', JSON.stringify(items));
  }

  private updateCacheAndEmit(source: CartItemsSource | null | undefined): void {
    const items = this.normalizeCartItems(source);
    this.cartCache.clear();
    items.forEach(item => this.cartCache.set(item.id, item));
    this.cartSubject.next(items);
  }

  private normalizeCartItems(source: CartItemsSource | null | undefined): CartItem[] {
    const rawItems: CartItemsSource | undefined = (() => {
      if (!source) return [];
      if (Array.isArray(source)) return source;
      const candidates = source as Record<string, unknown>;
      const possibleKeys = ['items', 'cartItems', 'data', 'cart', 'results'];
      for (const key of possibleKeys) {
        const value = candidates[key];
        if (Array.isArray(value)) {
          return value as CartItem[];
        }
      }
      return [];
    })();

    if (!Array.isArray(rawItems)) return [];

    return rawItems.map((item) => {
      const existing = this.cartCache.get((item as any).id);
      return this.normalizeItem(item, existing?.product, existing?.quantity);
    });
  }

  private normalizeItem(item: any, fallbackProduct?: Product, fallbackQuantity?: number): CartItem {
    const product = item?.product ?? fallbackProduct;
    const productId = item?.productId ?? product?.id ?? item?.id ?? '';
    const quantityValue = item?.quantity ?? fallbackQuantity ?? 1;
    const priceCandidate =
      product?.price ??
      item?.unitPrice ??
      item?.price ??
      (typeof fallbackProduct?.price === 'number' ? fallbackProduct.price : 0);
    const price = typeof priceCandidate === 'number' ? priceCandidate : Number(priceCandidate) || 0;

    return {
      ...item,
      productId,
      product: product ? { ...product, price } : undefined,
      quantity: typeof quantityValue === 'number' ? quantityValue : Number(quantityValue) || 1,
    } as CartItem;
  }

  private resetCart(): void {
    this.cartCache.clear();
    this.cartSubject.next([]);
  }

  private syncGuestCartToServer(items: CartItem[]): Observable<unknown> {
    const requests = items
      .map(item => {
        const productId = item.productId || item.id;
        const quantity = item.quantity || 1;
        if (!productId) return null;
        return this.http.post<CartItem>(`${baseUrlCart}/items`, { productId, quantity });
      })
      .filter((req): req is Observable<CartItem> => !!req);

    if (!requests.length) {
      localStorage.removeItem('guestCart');
      return of(null);
    }

    return forkJoin(requests).pipe(
      tap(() => localStorage.removeItem('guestCart'))
    );
  }
}
