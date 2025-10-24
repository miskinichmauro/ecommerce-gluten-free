import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsyncPipe } from '@angular/common';
import { CartItemsComponent } from 'src/app/carts/cart-items/cart-items.component';
import { CartService } from 'src/app/carts/services/cart.service';

@Component({
  selector: 'cart-sidebar',
  standalone: true,
  imports: [CommonModule, CartItemsComponent, AsyncPipe],
  templateUrl: './cart-sidebar.component.html',
  styleUrl: './cart-sidebar.component.css',
})
export class CartSidebarComponent implements OnInit {
  cartService = inject(CartService);
  cartItems$ = this.cartService.cart$;

  ngOnInit(): void {
    this.cartService.loadCart().subscribe();
  }
}
