import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, EventEmitter, Output, ViewChild, input } from '@angular/core';

@Component({
  selector: 'image-carrusel',
  imports: [],
  templateUrl: './image-carrusel.component.html',
  styleUrl: './image-carrusel.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ImageCarruselComponent implements AfterViewInit{
  images = input.required<string[]>();

  spaceBetween = 10;
  slidesPerView = 1;
  @Output() slideChange = new EventEmitter<number>();

  @ViewChild('swiper') swiperRef!: ElementRef<any>;

  ngAfterViewInit() {
    const swiperEl = this.swiperRef?.nativeElement as any;
    if (swiperEl) {
      const imgs = this.images();
      swiperEl.pagination = { clickable: true, dynamicBullets: true, type: 'bullets' };
      swiperEl.navigation = true;
      swiperEl.autoplay = {
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
        reverseDirection: false
      };
      swiperEl.speed = 1200;
      swiperEl.effect = 'fade';
      swiperEl.fadeEffect = { crossFade: true };
      swiperEl.spaceBetween = this.spaceBetween;
      swiperEl.rewind = false;
      swiperEl.loopAdditionalSlides = 1;
      swiperEl.slidesPerView = this.slidesPerView;
      swiperEl.loop = imgs && imgs.length > 1;
      swiperEl.initialize();

      swiperEl.addEventListener('slidechange', () => {
        const idx = swiperEl.swiper?.realIndex ?? 0;
        this.slideChange.emit(idx);
      });
    }
  }

  goTo(index: number) {
    const swiperEl = this.swiperRef?.nativeElement as any;
    if (swiperEl?.swiper) {
      swiperEl.swiper.slideToLoop(index);
      this.slideChange.emit(index);
    }
  }
}
