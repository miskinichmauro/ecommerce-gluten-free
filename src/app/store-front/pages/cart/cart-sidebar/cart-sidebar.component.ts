import { Component, OnInit, inject } from '@angular/core';
import { CartItem } from 'src/app/carts/interfaces/cart-item';
import { CartService } from 'src/app/carts/services/cart.service';
import { CartItemsComponent } from "src/app/carts/cart-items/cart-items.component";

@Component({
  selector: 'app-cart-sidebar',
  imports: [CartItemsComponent],
  templateUrl: './cart-sidebar.component.html',
  styleUrl: './cart-sidebar.component.css',
})
export class CartSidebarComponent implements OnInit {
  private readonly cartService = inject(CartService);

  cartItems: CartItem[] = [];

  ngOnInit() {
    this.cartService.cart$.subscribe(items => this.cartItems = items);
    this.cartService.loadCart();
  }
}
