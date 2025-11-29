import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Product } from 'src/app/products/interfaces/product';
import { ProductService } from 'src/app/products/services/products.service';
import { LoadingComponent } from "src/app/shared/components/loading/loading.component";
import { environment } from 'src/environments/environment';
import { AddToCartButtonComponent } from 'src/app/products/components/add-to-cart-button/add-to-cart-button.component';
import { ImageGalleryComponent, GalleryImage } from 'src/app/shared/components/image-gallery/image-gallery.component';
import { Category } from 'src/app/categories/interfaces/category.interface';
import { Tag } from 'src/app/tags/interfaces/tag.interface';
import { resolveProductImageValue } from '@shared/utils/product-image.utils';

@Component({
  selector: 'app-product',
  imports: [CommonModule, LoadingComponent, ImageGalleryComponent, AddToCartButtonComponent],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly baseUrl = environment.baseUrl;

  productSlug = this.activatedRoute.snapshot.params['slug'];

  product = signal<Product | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  quantity = signal<number>(1);

  constructor() {}

  ngOnInit(): void {
    this.resetScrollTop();
    this.loadProduct();
  }

  private async loadProduct() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const data = await firstValueFrom(this.productService.getProductByIdSlug(this.productSlug));
      this.product.set(data);
      this.resetScrollTop();
    } catch (err) {
      this.error.set('Error al cargar el producto');
    } finally {
      this.loading.set(false);
    }
  }

  galleryImages = computed<GalleryImage[]>(() => {
    const product = this.product();
    if (!product) return [];

    const source = Array.isArray(product.images) ? product.images : [];
    const images = source
      .map((img, idx) => {
        const original = resolveProductImageValue(img, 'original');
        if (!original) return null;
        const small = resolveProductImageValue(img, 'small');
        const base: GalleryImage = {
          src: this.mapToImageUrl(original),
          identifier: `${idx}-${original}`,
          alt: product.title ?? `Imagen ${idx + 1}`,
        };

        if (small) {
          base.thumb = this.mapToImageUrl(small);
        }

        return base;
      })
      .filter((img): img is GalleryImage => img !== null);

    if (images.length) {
      return images;
    }

    const fallback = 'assets/images/default-image.jpg';
    return [
      {
        src: fallback,
        identifier: 'fallback',
        alt: product.title ?? 'Imagen',
        thumb: fallback,
      },
    ];
  });

  private mapToImageUrl(value: string): string {
    if (!value) return 'assets/images/default-image.jpg';
    if (/^https?:\/\//.test(value)) return value;
    if (value.startsWith('assets/')) return value;
    return `${this.baseUrl}/files/product/${value}`;
  }

  toTagName(tag: any): string {
    if (!tag) return '';
    if (typeof tag === 'string') return tag;
    if (typeof tag === 'object' && 'name' in tag && typeof (tag as any).name === 'string') {
      return (tag as any).name;
    }
    return '';
  }

  categoryName(): string {
    const cat = this.product()?.category as Category;
    if (!cat) return '';
    if (typeof cat === 'string') return cat;
    if (typeof cat === 'object' && 'name' in cat && typeof (cat as any).name === 'string') {
      return (cat as any).name;
    }
    return '';
  }

  increment() {
    const next = Math.min((this.product()?.stock ?? 99), this.quantity() + 1);
    this.quantity.set(next);
  }

  decrement() {
    this.quantity.update((q) => Math.max(1, q - 1));
  }

  onQuantityInput(event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (!target) return;
    const maxStock = this.product()?.stock;
    let value = parseInt(target.value, 10);
    if (isNaN(value) || value < 1) value = 1;
    if (typeof maxStock === 'number' && maxStock > 0 && value > maxStock) {
      value = maxStock;
    }
    this.quantity.set(value);
  }

  private resetScrollTop() {
    if (typeof window === 'undefined') return;
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'auto' }));
  }
}
