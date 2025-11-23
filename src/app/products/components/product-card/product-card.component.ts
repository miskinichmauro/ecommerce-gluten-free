import { Component, input } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Product } from '../../interfaces/product';
import { SlicePipe } from '@angular/common';
import { ProductImagePipe } from '../../pipes/product-image.pipe';
import { GuaraniesPipe } from '@shared/pipes/guaranies-pipe';
import { AddToCartButtonComponent } from '../add-to-cart-button/add-to-cart-button.component';

@Component({
  selector: 'product-card',
  imports: [RouterLink, SlicePipe, ProductImagePipe, GuaraniesPipe, AddToCartButtonComponent],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  product = input.required<Product>();
}
