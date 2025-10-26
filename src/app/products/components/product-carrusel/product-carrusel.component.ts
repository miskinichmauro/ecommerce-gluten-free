import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, input, AfterViewInit } from '@angular/core';
import { ProductCardComponent } from '../product-card/product-card.component';
import { Product } from '../../interfaces/product';

@Component({
  selector: 'product-carrusel',
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './product-carrusel.component.html',
  styleUrl: './product-carrusel.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProductCarruselComponent implements AfterViewInit {
  products = input.required<Product[]>();

  ngAfterViewInit() {
    const swiperEl = document.querySelector('swiper-container') as any;

    if (swiperEl) {
      swiperEl.navigation = true;
      swiperEl.loop = true;
      swiperEl.breakpoints = {
        0: {
          slidesPerView: 1,
          spaceBetween: 10,
        },
        780: {
          slidesPerView: 2,
          spaceBetween: 15,
        },
        1280: {
          slidesPerView: 3,
          spaceBetween: 20,
        },
        1900: {
          slidesPerView: 5,
          spaceBetween: 25,
        }
      };
      swiperEl.initialize();
    }
  }
}
