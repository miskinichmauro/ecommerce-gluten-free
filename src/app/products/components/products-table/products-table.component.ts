import { Component, input, signal } from '@angular/core';
import { Product } from '../../interfaces/product';
import { ProductImagePipe } from '../../pipes/product-image.pipe';
import { RouterLink } from "@angular/router";
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'products-table',
  imports: [ProductImagePipe, RouterLink, CurrencyPipe],
  templateUrl: './products-table.component.html',
  styleUrl: './products-table.component.css',
})
export class ProductsTableComponent {
  products = input.required<Product[]>();
  currentPage = input.required<number>();
  countPage = input.required<number>();
}
