import { CommonModule } from '@angular/common';
import { Component, OnChanges, SimpleChanges, ViewChild, input, output, signal } from '@angular/core';
import { ImageCarruselComponent } from '../image-carrusel/image-carrusel.component';
import { XCircle } from '../x-circle/x-circle';

export interface GalleryImage {
  src: string;
  identifier?: string;
  alt?: string;
}

@Component({
  selector: 'image-gallery',
  standalone: true,
  imports: [CommonModule, ImageCarruselComponent, XCircle],
  templateUrl: './image-gallery.component.html',
  styleUrl: './image-gallery.component.css',
})
export class ImageGalleryComponent implements OnChanges {
  images = input.required<GalleryImage[]>();
  removable = input<boolean>(false);

  remove = output<string>();
  slideChange = output<number>();

  @ViewChild('carousel') carousel?: ImageCarruselComponent;
  currentIndex = signal<number>(0);

  imageUrls(): string[] {
    return this.images()
      .map((img) => img?.src)
      .filter((src): src is string => !!src);
  }

  handleSlideChange(idx: number) {
    this.currentIndex.set(idx);
    this.slideChange.emit(idx);
  }

  goTo(idx: number) {
    this.carousel?.goTo(idx);
    this.handleSlideChange(idx);
  }

  onRemove(event: Event, identifier: string) {
    event.stopPropagation();
    this.remove.emit(identifier);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['images']) {
      this.currentIndex.set(0);
      queueMicrotask(() => this.carousel?.goTo(0));
    }
  }
}
