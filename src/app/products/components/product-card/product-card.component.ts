import { Component, inject, input } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Product } from '../../interfaces/product';
import { SlicePipe } from '@angular/common';
import { ProductImagePipe } from '../../pipes/product-image.pipe';
import { CartService } from '../../../carts/services/cart.service';

@Component({
  selector: 'product-card',
  imports: [RouterLink, SlicePipe, ProductImagePipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  product = input.required<Product>();

  private readonly CartService = inject(CartService);

  addToCart() {
    this.CartService.addItem(this.product().id).subscribe();
  }
}
