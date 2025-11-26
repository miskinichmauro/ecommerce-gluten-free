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
  private listenersAttached = false;
  private lastIndex = 0;
  private wasCarouselEnabled = false;

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
    const instance = swiperEl.swiper as any | undefined;
    const currentIndex = instance?.realIndex ?? this.lastIndex ?? 0;

    if (enableCarousel) {
      swiperEl.navigation = true;
      swiperEl.rewind = true;
      swiperEl.centeredSlides = true;
      swiperEl.centeredSlidesBounds = true;
      swiperEl.loop = false;
      swiperEl.initialSlide = 0;
      swiperEl.allowTouchMove = true;
      swiperEl.autoplay = { delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true };
      swiperEl.speed = 800;
      swiperEl.breakpoints = {
        0: { slidesPerView: 'auto', spaceBetween: 18 },
        640: { slidesPerView: 'auto', spaceBetween: 22 },
        1024: { slidesPerView: 'auto', spaceBetween: 26 },
        1280: { slidesPerView: 'auto', spaceBetween: 32 }
      };
      if (instance) {
        instance.params.allowTouchMove = true;
        instance.allowTouchMove = true;
        instance.params.autoplay = instance.params.autoplay || {};
        instance.params.autoplay.pauseOnMouseEnter = true;
        instance.params.autoplay.disableOnInteraction = false;
        this.attachHoverHandlers(swiperEl);
      }
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
      if (instance) {
        instance.params.allowTouchMove = false;
        instance.allowTouchMove = false;
        this.detachHoverHandlers(swiperEl);
      }
    }

    if (this.initialized) {
      swiperEl.updateSwiper?.();
      if (enableCarousel) {
        this.lastIndex = currentIndex;
        swiperEl.swiper?.slideTo?.(this.lastIndex, 0);
        swiperEl.swiper?.autoplay?.start?.();
      } else {
        this.lastIndex = 0;
        swiperEl.swiper?.autoplay?.stop?.();
      }
    } else {
      swiperEl.initialize();
      if (enableCarousel) {
        // Asegurar que el autoplay arranque desde el primer slide real
        this.resetToFirstSlide(swiperEl);
        swiperEl.swiper?.autoplay?.start?.();
      }
      this.initialized = true;
    }

    this.wasCarouselEnabled = enableCarousel;
  }

  private attachHoverHandlers(swiperEl: any) {
    if (this.listenersAttached) return;

    swiperEl.addEventListener('mouseenter', () => {
      swiperEl.swiper?.autoplay?.stop?.();
    });

    swiperEl.addEventListener('mouseleave', () => {
      swiperEl.swiper?.autoplay?.start?.();
    });

    this.listenersAttached = true;
  }

  private detachHoverHandlers(swiperEl: any) {
    // Not removing listeners to keep logic simple; autoplay is stopped when carousel is disabled.
    swiperEl.swiper?.autoplay?.stop?.();
  }

  private resetToFirstSlide(swiperEl: any) {
    swiperEl.swiper?.slideTo?.(0, 0);
    swiperEl.swiper?.updateSlides?.();
  }
}
