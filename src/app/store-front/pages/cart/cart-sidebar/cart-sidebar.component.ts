import { Component, inject, signal } from '@angular/core';
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
  styleUrls: [],
})
export class CartSidebarComponent {
  cartService = inject(CartService);
  private readonly configurationService = inject(ConfigurationService);
  private readonly router = inject(Router);
  cartItems$ = this.cartService.cart$;
  clearing = signal(false);

  readonly total$ = this.cartItems$.pipe(
    map(items => items.reduce((acc, item) => acc + (item.product?.price ?? 0) * item.quantity, 0))
  );

  clearCart() {
    this.clearing.set(true);
    const animationMs = 250;
    this.cartService.clearCart({ delayMs: animationMs }).subscribe({
      complete: () => setTimeout(() => this.clearing.set(false), animationMs)
    });
  }

  goToCart() {
    this.configurationService.closeSidebar();
    this.router.navigateByUrl('/cart');
  }
}
