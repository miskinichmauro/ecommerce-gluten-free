import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { CartItemsComponent } from 'src/app/carts/cart-items/cart-items.component';
import { CartService } from 'src/app/carts/services/cart.service';
import { map } from 'rxjs';
import { GuaraniesPipe } from '@shared/pipes/guaranies-pipe';
import { ConfigurationService } from '@shared/services/configuration.service';

@Component({
  selector: 'cart-sidebar',
  standalone: true,
  imports: [CommonModule, CartItemsComponent, AsyncPipe, GuaraniesPipe],
  templateUrl: './cart-sidebar.component.html',
  styleUrl: './cart-sidebar.component.css',
})
export class CartSidebarComponent implements OnInit {
  cartService = inject(CartService);
  private readonly configurationService = inject(ConfigurationService);
  private readonly router = inject(Router);
  cartItems$ = this.cartService.cart$;

  ngOnInit(): void {
    this.cartService.loadCart().subscribe();
  }

  readonly total$ = this.cartItems$.pipe(
    map(items => items.reduce((acc, item) => acc + (item.product?.price ?? 0) * item.quantity, 0))
  );

  clearCart() {
    this.cartService.clearCart().subscribe();
  }

  goToCart() {
    this.configurationService.closeSidebar();
    this.router.navigateByUrl('/cart');
  }
}
