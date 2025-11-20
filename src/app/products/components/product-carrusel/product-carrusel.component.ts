import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
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
  @ViewChild('swiper') swiperRef!: ElementRef<any>;

  ngAfterViewInit() {
    const swiperEl = this.swiperRef?.nativeElement as any;
    if (!swiperEl) return;

    const items = this.products();
    const enableCarousel = this.shouldEnableCarousel(items.length);

    if (enableCarousel) {
      swiperEl.navigation = true;
      swiperEl.centeredSlides = true;
      swiperEl.centeredSlidesBounds = true;
      swiperEl.loop = true;
      swiperEl.autoplay = { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true };
      swiperEl.speed = 800;
      swiperEl.breakpoints = {
        0: { slidesPerView: 'auto', spaceBetween: 18 },
        640: { slidesPerView: 'auto', spaceBetween: 22 },
        1024: { slidesPerView: 'auto', spaceBetween: 26 },
        1280: { slidesPerView: 'auto', spaceBetween: 32 }
      };
    } else {
      swiperEl.navigation = false;
      swiperEl.loop = false;
      swiperEl.autoplay = false;
      swiperEl.centeredSlides = false;
      swiperEl.centeredSlidesBounds = false;
      swiperEl.allowTouchMove = false;
      swiperEl.breakpoints = {
        0: { slidesPerView: 'auto', spaceBetween: 18 },
        640: { slidesPerView: 'auto', spaceBetween: 22 },
        1024: { slidesPerView: 'auto', spaceBetween: 28 },
        1280: { slidesPerView: 'auto', spaceBetween: 32 }
      };
    }

    swiperEl.initialize();
  }

  private shouldEnableCarousel(totalProducts: number): boolean {
    if (typeof window === 'undefined') return false;
    if (window.innerWidth < 1024) return totalProducts > 1;
    return totalProducts > 5;
  }
}
