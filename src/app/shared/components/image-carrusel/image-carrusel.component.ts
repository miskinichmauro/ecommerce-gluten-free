import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, EventEmitter, OnChanges, Output, SimpleChanges, ViewChild, input } from '@angular/core';

@Component({
  selector: 'image-carrusel',
  imports: [],
  templateUrl: './image-carrusel.component.html',
  styleUrl: './image-carrusel.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ImageCarruselComponent implements AfterViewInit, OnChanges {
  images = input.required<string[]>();
  autoplay = input<boolean>(true);
  loop = input<boolean>(true);
  effect = input<'fade' | 'slide'>('fade');
  autoplayDelay = input<number>(5000);

  spaceBetween = 10;
  slidesPerView = 1;
  @Output() slideChange = new EventEmitter<number>();

  @ViewChild('swiper') swiperRef!: ElementRef<any>;

  private slideListenerAdded = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['images'] || changes['autoplay'] || changes['loop'] || changes['effect']) {
      this.refreshSwiper();
    }
  }

  ngAfterViewInit() {
    queueMicrotask(() => this.setupSwiper());
  }

  private setupSwiper() {
    const swiperEl = this.swiperRef?.nativeElement as any;
    if (!swiperEl) return;

    const { enableAutoplay } = this.applyConfig(swiperEl);
    swiperEl.initialize();
    if (enableAutoplay) {
      swiperEl.swiper?.autoplay?.start();
    }
    this.addSlideListener(swiperEl);
  }

  goTo(index: number) {
    const swiperEl = this.swiperRef?.nativeElement as any;
    if (swiperEl?.swiper) {
      const useLoop = swiperEl.swiper.params?.loop;
      const slideFn = useLoop ? swiperEl.swiper.slideToLoop.bind(swiperEl.swiper) : swiperEl.swiper.slideTo.bind(swiperEl.swiper);
      slideFn(index);
      this.slideChange.emit(index);
    }
  }

  private refreshSwiper() {
    const swiperEl = this.swiperRef?.nativeElement as any;
    if (!swiperEl) return;

    const { enableAutoplay } = this.applyConfig(swiperEl);

    if (!swiperEl.swiper) {
      swiperEl.initialize();
      if (enableAutoplay) {
        swiperEl.swiper?.autoplay?.start();
      }
    } else {
      swiperEl.swiper.update();
      if (enableAutoplay) {
        swiperEl.swiper.autoplay?.start();
      } else {
        swiperEl.swiper.autoplay?.stop();
      }
    }

    this.addSlideListener(swiperEl);
  }

  private applyConfig(swiperEl: any) {
    const imgs = this.images();
    const hasMultiple = Array.isArray(imgs) && imgs.length > 1;
    const enableAutoplay = this.autoplay() && hasMultiple;
    const enableLoop = this.loop() && hasMultiple;

    swiperEl.pagination = { clickable: true, dynamicBullets: true, type: 'bullets' };
    swiperEl.navigation = true;
    swiperEl.autoplay = enableAutoplay
      ? {
          delay: this.autoplayDelay() ?? 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
          reverseDirection: false,
        }
      : false;
    swiperEl.speed = 800;
    swiperEl.effect = this.effect();
    swiperEl.fadeEffect = this.effect() === 'fade' ? { crossFade: true } : undefined;
    swiperEl.spaceBetween = this.spaceBetween;
    swiperEl.rewind = !enableLoop;
    swiperEl.loopAdditionalSlides = enableLoop ? 1 : 0;
    swiperEl.slidesPerView = this.slidesPerView;
    swiperEl.loop = enableLoop;

    return { enableAutoplay };
  }

  private addSlideListener(swiperEl: any) {
    if (this.slideListenerAdded) return;
    swiperEl.addEventListener('slidechange', () => {
      const idx = swiperEl.swiper?.realIndex ?? 0;
      this.slideChange.emit(idx);
    });
    this.slideListenerAdded = true;
  }
}
