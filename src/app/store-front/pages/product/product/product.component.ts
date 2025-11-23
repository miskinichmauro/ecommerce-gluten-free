import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Product } from 'src/app/products/interfaces/product';
import { ProductService } from 'src/app/products/services/products.service';
import { LoadingComponent } from "src/app/shared/components/loading/loading.component";
import { ImageCarruselComponent } from "src/app/shared/components/image-carrusel/image-carrusel.component";
import { environment } from 'src/environments/environment';
import { AddToCartButtonComponent } from 'src/app/products/components/add-to-cart-button/add-to-cart-button.component';

@Component({
  selector: 'app-product',
  imports: [CommonModule, LoadingComponent, ImageCarruselComponent, AddToCartButtonComponent],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly baseUrl = environment.baseUrl;

  productslug = this.activatedRoute.snapshot.params['slug'];

  product = signal<Product | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  quantity = signal<number>(1);
  currentSlide = signal(0);

  constructor() {}

  ngOnInit(): void {
    this.loadProduct();
  }

  private async loadProduct() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const data = await firstValueFrom(this.productService.getProductByIdSlug(this.productslug));
      this.product.set(data);
    } catch (err) {
      this.error.set('Error al cargar el producto');
    } finally {
      this.loading.set(false);
    }
  }

  productImageUrls(): string[] {
    const product = this.product();
    if (!product) return [];

    const source = Array.isArray(product.images) ? product.images : [];
    const urls = source
      .map((img) => this.resolveImageValue(img))
      .filter((img): img is string => !!img)
      .map((img) => this.mapToImageUrl(img));

    return urls.length ? urls : ['assets/images/default-image.jpg'];
  }

  private resolveImageValue(value: unknown): string | null {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      const candidate =
        (value as any).secureUrl ||
        (value as any).url ||
        (value as any).path ||
        (value as any).fileName ||
        (value as any).filename ||
        (value as any).name ||
        (value as any).id;
      return typeof candidate === 'string' ? candidate : null;
    }
    return null;
  }

  private mapToImageUrl(value: string): string {
    if (!value) return 'assets/images/default-image.jpg';
    if (/^https?:\/\//.test(value)) return value;
    if (value.startsWith('assets/')) return value;
    return `${this.baseUrl}/files/product/${value}`;
  }

  toTagName(tag: unknown): string {
    if (!tag) return '';
    if (typeof tag === 'string') return tag;
    if (typeof tag === 'object' && 'name' in tag && typeof (tag as any).name === 'string') {
      return (tag as any).name;
    }
    return '';
  }

  categoryName(): string {
    const cat = this.product()?.category as unknown;
    console.log(this.product());
    if (!cat) return '';
    if (typeof cat === 'string') return cat;
    if (typeof cat === 'object' && 'name' in cat && typeof (cat as any).name === 'string') {
      return (cat as any).name;
    }
    return '';
  }

  onSlideChange(idx: number) {
    this.currentSlide.set(idx);
  }

  increment() {
    const next = Math.min((this.product()?.stock ?? 99), this.quantity() + 1);
    this.quantity.set(next);
  }

  decrement() {
    this.quantity.update((q) => Math.max(1, q - 1));
  }
}
