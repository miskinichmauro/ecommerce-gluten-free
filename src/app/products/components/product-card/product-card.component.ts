import { Component, inject, input } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Product } from '../../interfaces/product';
import { SlicePipe } from '@angular/common';
import { ProductImagePipe } from '../../pipes/product-image.pipe';
import { GuaraniesPipe } from '@shared/pipes/guaranies-pipe';
import { CartService } from 'src/app/carts/services/cart.service';

@Component({
  selector: 'product-card',
  imports: [RouterLink, SlicePipe, ProductImagePipe, GuaraniesPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  product = input.required<Product>();

  private readonly cartService = inject(CartService);

  addToCart() {
    this.cartService.addItem(this.product()).subscribe();
  }
}
