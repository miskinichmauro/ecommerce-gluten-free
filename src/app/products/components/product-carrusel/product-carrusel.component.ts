import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, input, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
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
  private initialized = false;

  ngAfterViewInit() {
    this.configureSwiper();
  }

  @HostListener('window:resize')
  onResize() {
    this.configureSwiper();
  }

  private configureSwiper() {
    const swiperEl = this.swiperRef?.nativeElement as any;
    if (!swiperEl) return;

    const items = this.products() ?? [];
    const enableCarousel = items.length > 1;

    if (enableCarousel) {
      swiperEl.navigation = true;
      swiperEl.centeredSlides = true;
      swiperEl.centeredSlidesBounds = true;
      swiperEl.loop = items.length > 2;
      swiperEl.allowTouchMove = true;
      swiperEl.autoplay = { delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true };
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

    if (this.initialized) {
      swiperEl.updateSwiper?.();
      if (enableCarousel) {
        swiperEl.swiper?.slideToLoop?.(0);
        swiperEl.swiper?.autoplay?.start?.();
      } else {
        swiperEl.swiper?.autoplay?.stop?.();
      }
    } else {
      swiperEl.initialize();
      this.initialized = true;
    }
  }
}
