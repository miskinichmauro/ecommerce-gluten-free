import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, input } from '@angular/core';
import { ProductImagePipe } from '@products/pipes/product-image.pipe';

@Component({
  selector: 'image-carrusel',
  imports: [ProductImagePipe],
  templateUrl: './image-carrusel.component.html',
  styleUrl: './image-carrusel.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ImageCarruselComponent implements AfterViewInit{
  images = input.required<string[]>();

  spaceBetween = 10;
  slidesPerView = 1;

  ngAfterViewInit() {
    const swiperEl = document.querySelector('swiper-container') as any;

    if (swiperEl) {
      const imgs = this.images();
      swiperEl.pagination = { clickable: true };
      swiperEl.navigation = true;
      swiperEl.spaceBetween = this.spaceBetween;
      swiperEl.slidesPerView = this.slidesPerView;
      swiperEl.loop = imgs && imgs.length > 1;
      swiperEl.initialize();
    }
  }
}
