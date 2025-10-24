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

  remove(id: string) {
    this.cartService.removeItem(id).subscribe();
  }

  increaseQuantity(item: CartItem) {
    this.cartService.updateItem(item.id, item.quantity + 1).subscribe();
  }

  decreaseQuantity(item: CartItem) {
    if (item.quantity > 1) {
      this.cartService.updateItem(item.id, item.quantity - 1).subscribe();
    }
  }
}
