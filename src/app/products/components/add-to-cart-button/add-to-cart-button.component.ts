import { Component, inject, input, signal } from '@angular/core';
import { Product } from '../../interfaces/product';
import { CartService } from 'src/app/carts/services/cart.service';
import { ToastService } from '@shared/services/toast.service';

@Component({
  selector: 'add-to-cart-button',
  standalone: true,
  imports: [],
  templateUrl: './add-to-cart-button.component.html',
  styleUrl: './add-to-cart-button.component.css',
})
export class AddToCartButtonComponent {
  product = input.required<Product>();
  quantity = input<number>(1);
  buttonClass = input<string>('');
  disabled = input<boolean>(false);

  private readonly cartService = inject(CartService);
  private readonly toastService = inject(ToastService);

  loading = signal<boolean>(false);
  success = signal<boolean>(false);

  buttonClasses(): string {
    const extras = this.buttonClass();
    return ['btn btn-primary flex items-center justify-center min-w-[150px]', extras].filter(Boolean).join(' ');
  }

  addToCart() {
    if (this.disabled()) return;
    const product = this.product();
    if (!product) return;

    const quantity = Math.max(1, Number(this.quantity()) || 1);

    this.toastService.activateLoading();
    this.loading.set(true);
    this.success.set(false);

    this.cartService.addItem(product, quantity).subscribe({
      next: () => {
        this.toastService.activateSuccess();
        this.loading.set(false);
        this.success.set(true);
        setTimeout(() => this.success.set(false), 800);
      },
      error: () => {
        this.toastService.deactivateLoading();
        this.loading.set(false);
      },
    });
  }
}
