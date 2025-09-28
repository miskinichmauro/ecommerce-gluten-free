import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, input, AfterViewInit } from '@angular/core';
import { ProductImagePipe } from '../../pipes/product-image.pipe';

@Component({
  selector: 'product-carrusel',
  imports: [CommonModule, ProductImagePipe],
  templateUrl: './product-carrusel.component.html',
  styleUrls: ['./product-carrusel.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProductCarruselComponent implements AfterViewInit {
  images = input.required<string[]>();
  spaceBetween = 20;
  slidesPerView = 3;

  ngAfterViewInit() {
    const swiperEl = document.querySelector('swiper-container') as any;

    if (swiperEl) {
      swiperEl.pagination = { clickable: true };
      swiperEl.navigation = true;
      swiperEl.spaceBetween = this.spaceBetween;
      swiperEl.slidesPerView = this.slidesPerView;
      swiperEl.loop = this.images.length > 1;
      swiperEl.initialize();
    }
  }
}
