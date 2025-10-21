import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, finalize, Observable,  of,  tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastService } from '@shared/services/toast.service';
import { CartItem } from 'src/app/carts/interfaces/cart-item';
import { AuthService } from '@auth/auth.service';

const baseUrlCart = `${environment.baseUrl}/api/cart`;

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);
  private readonly AuthService = inject(AuthService);
  private cartCache = new Map<string, CartItem>();
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();

  loadCart(): void {
    if (this.cartCache.size) {
      this.cartSubject.next(Array.from(this.cartCache.values()));
      return;
    }

    this.http.get<CartItem[]>(baseUrlCart).pipe(
      tap(items => items.forEach(i => this.cartCache.set(i.id, i)))
    ).subscribe(items => this.cartSubject.next(items));
  }

  addItem(productId: string, quantity = 1): Observable<CartItem> {
    if (this.AuthService.authStatus() === 'authenticated') {
      this.toastService.activateLoading();
      return this.http.post<CartItem>(`${baseUrlCart}/items`, { productId, quantity }).pipe(
        tap(item => {
          this.cartCache.set(item.id, item);
          this.cartSubject.next(Array.from(this.cartCache.values()));
          this.toastService.activateSuccess();
        }),
        finalize(() => this.toastService.deactivateLoading())
      );
    } else {
      const localCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const existingItem = localCart.find((i: any) => i.productId === productId);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        localCart.push({ productId, quantity });
      }

      localStorage.setItem('guestCart', JSON.stringify(localCart));
      // this.toastService.activateInfo('Producto agregado (modo invitado)');
      return of();
    }
  }

  updateItem(id: string, quantity: number): Observable<CartItem> {
    this.toastService.activateLoading();
    return this.http.patch<CartItem>(`${baseUrlCart}/items/${id}`, { quantity }).pipe(
      tap(item => {
        this.cartCache.set(item.id, item);
        this.cartSubject.next(Array.from(this.cartCache.values()));
        this.toastService.activateSuccess();
      }),
      finalize(() => this.toastService.deactivateLoading())
    );
  }

  removeItem(id: string): Observable<void> {
    this.toastService.activateLoading();
    return this.http.delete<void>(`${baseUrlCart}/items/${id}`).pipe(
      tap(() => {
        this.cartCache.delete(id);
        this.cartSubject.next(Array.from(this.cartCache.values()));
        this.toastService.activateSuccess();
      }),
      finalize(() => this.toastService.deactivateLoading())
    );
  }

  clearCart(): void {
    this.http.delete(baseUrlCart).subscribe(() => {
      this.cartCache.clear();
      this.cartSubject.next([]);
    });
  }
}
