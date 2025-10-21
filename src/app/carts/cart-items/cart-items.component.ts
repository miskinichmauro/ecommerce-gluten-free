import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductImagePipe } from "../../products/pipes/product-image.pipe";
import { SlicePipe } from '@angular/common';
import { CartItem } from 'src/app/carts/interfaces/cart-item';

@Component({
  selector: 'cart-items',
  imports: [RouterLink, ProductImagePipe, SlicePipe],
  templateUrl: './cart-items.component.html',
  styleUrl: './cart-items.component.css',
})
export class CartItemsComponent {
  cartItems = input.required<CartItem[]>();
}
