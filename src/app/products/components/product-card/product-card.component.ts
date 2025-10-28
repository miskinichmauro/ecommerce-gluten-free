import { Component, inject, input, signal } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Product } from '../../interfaces/product';
import { SlicePipe } from '@angular/common';
import { ProductImagePipe } from '../../pipes/product-image.pipe';
import { GuaraniesPipe } from '@shared/pipes/guaranies-pipe';
import { CartService } from 'src/app/carts/services/cart.service';
import { ToastService } from '@shared/services/toast.service';

@Component({
  selector: 'product-card',
  imports: [RouterLink, SlicePipe, ProductImagePipe, GuaraniesPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  product = input.required<Product>();

  toastService = inject(ToastService);
  private readonly cartService = inject(CartService);

  loading = signal<boolean>(false);
  success = signal<boolean>(false);

  addToCart() {
    this.toastService.activateLoading();
    this.loading.set(true);
    this.success.set(false);

    this.cartService.addItem(this.product()).subscribe(() => {
      this.toastService.activateSuccess();
      this.loading.set(false);
      this.success.set(true)

      setTimeout(() => this.success.set(false), 800);
    });
  }
}
