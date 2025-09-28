import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, input, AfterViewInit } from '@angular/core';
import { ProductCardComponent } from '../product-card/product-card.component';
import { Product } from '../../interfaces/product';

@Component({
  selector: 'product-carrusel',
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './product-carrusel.component.html',
  styleUrls: ['./product-carrusel.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProductCarruselComponent implements AfterViewInit {
  products = input.required<Product[]>();
  spaceBetween = 20;
  slidesPerView = 3;

  ngAfterViewInit() {
    const swiperEl = document.querySelector('swiper-container') as any;

    if (swiperEl) {
      swiperEl.pagination = { clickable: true };
      swiperEl.navigation = true;
      swiperEl.spaceBetween = this.spaceBetween;
      swiperEl.slidesPerView = this.slidesPerView;
      swiperEl.loop = this.products.length > 1;
      swiperEl.initialize();
    }
  }
}
