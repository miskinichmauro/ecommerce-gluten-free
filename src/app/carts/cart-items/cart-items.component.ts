import { Component, input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductImagePipe } from "../../products/pipes/product-image.pipe";
import { SlicePipe } from '@angular/common';
import { CartItem } from 'src/app/carts/interfaces/cart-item';
import { CartService } from 'src/app/carts/services/cart.service';
import { GuaraniesPipe } from '@shared/pipes/guaranies-pipe';

@Component({
  selector: 'cart-items',
  imports: [RouterLink, ProductImagePipe, SlicePipe, GuaraniesPipe],
  templateUrl: './cart-items.component.html',
  styleUrls: ['./cart-items.component.css'],
})
export class CartItemsComponent {
  cartItems = input.required<CartItem[]>();
  private readonly cartService = inject(CartService);
  private readonly removingIds = new Set<string>();
  private readonly animationDelay = 250;

  isRemoving(id: string) {
    return this.removingIds.has(id);
  }

  startRemove(item: CartItem) {
    if (this.removingIds.has(item.id)) return;
    this.removingIds.add(item.id);

    setTimeout(() => {
      this.cartService.removeItem(item.id).subscribe({
        next: () => this.removingIds.delete(item.id),
        error: () => this.removingIds.delete(item.id),
        complete: () => this.removingIds.delete(item.id),
      });
    }, this.animationDelay);
  }

  increaseQuantity(item: CartItem) {
    this.cartService.updateItem(item.id, item.quantity + 1).subscribe();
  }

  decreaseQuantity(item: CartItem) {
    if (item.quantity > 1) {
      this.cartService.updateItem(item.id, item.quantity - 1).subscribe();
    }
  }

  onQuantityInput(event: Event, item: CartItem) {
    const target = event.target as HTMLInputElement | null;
    if (!target) return;
    let value = parseInt(target.value, 10);
    if (isNaN(value) || value < 1) value = 1;
    this.cartService.updateItem(item.id, value).subscribe();
  }
}
