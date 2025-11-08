import { Component, CUSTOM_ELEMENTS_SCHEMA, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'home-promos',
  imports: [],
  templateUrl: './home-promos.html',
  styleUrl: './home-promos.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomePromos implements AfterViewInit {
  @ViewChild('promosSwiper', { static: true }) promosSwiper?: ElementRef<any>;

  ngAfterViewInit() {
    const swiperEl = this.promosSwiper?.nativeElement;
    if (swiperEl) {
      swiperEl.loop = true;
      swiperEl.autoplay = { delay: 3000, disableOnInteraction: false };
      swiperEl.effect = 'fade';
      swiperEl.initialize();
    }
  }
}
