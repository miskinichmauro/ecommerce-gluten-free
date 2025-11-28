import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { CartItemsComponent } from 'src/app/carts/cart-items/cart-items.component';
import { CartService } from 'src/app/carts/services/cart.service';
import { GuaraniesPipe } from '@shared/pipes/guaranies-pipe';
import { AuthService } from '@auth/auth.service';
import { ConfigurationService } from '@shared/services/configuration.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CartItemsComponent, AsyncPipe, GuaraniesPipe],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly configurationService = inject(ConfigurationService);
  private readonly router = inject(Router);

  readonly cartItems$ = this.cartService.cart$;

  readonly subtotal$ = this.cartItems$.pipe(
    map(items => items.reduce((acc, item) => acc + (item.product?.price ?? 0) * item.quantity, 0))
  );

  readonly shipping$ = this.subtotal$.pipe(
    map(subtotal => subtotal > 0 ? 0 : 0)
  );

  readonly total$ = combineLatest([this.subtotal$, this.shipping$]).pipe(
    map(([subtotal, shipping]) => subtotal + shipping)
  );

  ngOnInit(): void {
    this.cartService.loadCart().subscribe();
  }

  goToBuy() {
    const isAuthenticated = this.authService.isAuthenticated();
    if (!isAuthenticated) {
      this.configurationService.openSidebar('auth');
      return;
    }
    this.router.navigateByUrl('/checkout');
  }
}
