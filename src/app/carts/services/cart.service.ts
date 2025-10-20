import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartService {
  private items: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);

  cart$ = this.cartSubject.asObservable();

  addItem(item: CartItem) {
    const existing = this.items.find(i => i.productId === item.productId);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      this.items.push(item);
    }
    this.cartSubject.next([...this.items]);
  }

  removeItem(productId: string) {
    this.items = this.items.filter(i => i.productId !== productId);
    this.cartSubject.next([...this.items]);
  }

  updateQuantity(productId: string, quantity: number) {
    const item = this.items.find(i => i.productId === productId);
    if (item) item.quantity = quantity;
    this.cartSubject.next([...this.items]);
  }

  clearCart() {
    this.items = [];
    this.cartSubject.next([]);
  }

  getTotal() {
    return this.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  }
}
