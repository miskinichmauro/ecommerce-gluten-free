import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { animate, scroll } from "@motionone/dom";

@Component({
  selector: 'home-hero',
  templateUrl: './home-hero.html',
  styleUrl: './home-hero.css',
})
export class HomeHero implements AfterViewInit {

  @ViewChild("heroBg") heroBg!: ElementRef<HTMLDivElement>;

  ngAfterViewInit() {
    animate(".hero-title", { opacity: [0, 1], y: ["40px", "0px"] }, { duration: 0.7 });
    animate(".hero-sub", { opacity: [0, 1] }, { duration: 1 });

    scroll(
      ({ y }) => {
        const progress = y.progress;
        this.heroBg.nativeElement.style.transform = `translateY(${progress * 60}px)`;
      },
      { target: this.heroBg.nativeElement }
    );
  }
}
