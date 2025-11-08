import { AfterViewInit, Component } from '@angular/core';
import { animate } from "@motionone/dom";
import { HomeContacts } from '@store-front/pages/home/components/home-contacts/home-contacts';
import { HomeFeaturedProducts } from '@store-front/pages/home/components/home-featured-products/home-featured-products';
import { HomeHero } from '@store-front/pages/home/components/home-hero/home-hero';
import { HomePromos } from '@store-front/pages/home/components/home-promos/home-promos';
import { HomeRecipes } from '@store-front/pages/home/components/home-recipes/home-recipes';

@Component({
  selector: 'app-home',
  imports: [
    HomeHero,
    HomePromos,
    HomeFeaturedProducts,
    HomeRecipes,
    HomeContacts
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements AfterViewInit {

  ngAfterViewInit() {
    const revealElements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {

          animate(
            entry.target as HTMLElement,
            {
              opacity: [0, 1],
              transform: ["translateY(40px)", "translateY(0px)"]
            },
            {
              duration: 0.7,
              easing: "ease-out"
            }
          );

          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    revealElements.forEach(el => observer.observe(el));
  }
}
