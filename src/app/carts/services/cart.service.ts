import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap, finalize, map } from 'rxjs';
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

  loadCart(): Observable<CartItem[]> {
    if (this.cartCache.size > 0) {
      const items = Array.from(this.cartCache.values());
      this.cartSubject.next(items);
      return of(items);
    }
    const isAuthenticated = this.auth.authStatus() === 'authenticated';
    const source$ = isAuthenticated
      ? this.http.get<CartItemsSource>(baseUrlCart)
      : of(this.getCartFromLocalStorage());
    return source$.pipe(
      map(items => this.normalizeCartItems(items)),
      tap(items => this.updateCacheAndEmit(items))
    );
  }

  addItem(product: Product, quantity = 1): Observable<CartItem | void> {
    const cartItem: CartItem = {
      id: product.id,
      product,
      productId: product.id,
      quantity,
    };
    const isAuthenticated = this.auth.authStatus() === 'authenticated';
    if (isAuthenticated) {
      this.toast.activateLoading();
      return this.http.post<CartItem>(`${baseUrlCart}/items`, { productId: product.id, quantity }).pipe(
        tap(item => {
          this.updateCacheAndEmit([...this.cartSubject.value, item]);
          this.toast.activateSuccess();
        }),
        finalize(() => this.toast.deactivateLoading())
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
    const isAuthenticated = this.auth.authStatus() === 'authenticated';
    if (isAuthenticated) {
      this.toast.activateLoading();
      return this.http.patch<CartItem>(`${baseUrlCart}/items/${id}`, { quantity }).pipe(
        tap(item => {
          this.cartCache.set(item.id, item);
          this.updateCacheAndEmit(Array.from(this.cartCache.values()));
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
    const isAuthenticated = this.auth.authStatus() === 'authenticated';
    if (isAuthenticated) {
      this.toast.activateLoading();
      return this.http.delete<void>(`${baseUrlCart}/items/${id}`).pipe(
        tap(() => {
          this.cartCache.delete(id);
          this.updateCacheAndEmit(Array.from(this.cartCache.values()));
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

  clearCart(): Observable<void> {
    const isAuthenticated = this.auth.authStatus() === 'authenticated';
    if (isAuthenticated) {
      return this.http.delete<void>(baseUrlCart).pipe(tap(() => this.resetCart()));
    } else {
      localStorage.removeItem('guestCart');
      this.resetCart();
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
  }

  private resetCart(): void {
    this.cartCache.clear();
    this.cartSubject.next([]);
  }
}
