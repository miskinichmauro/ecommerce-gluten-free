import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ImageCarruselComponent } from "@shared/components/image-carrusel/image-carrusel.component";

@Component({
  selector: 'home-promos',
  imports: [ImageCarruselComponent],
  templateUrl: './home-promos.html',
  styleUrl: './home-promos.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomePromos  {
  images: string[] = [
    'assets/images/gluten-free.jpg',
    'assets/images/gluten-free-450.jpg'
  ];
}
