import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Product } from 'src/app/products/interfaces/product';
import { ProductService } from 'src/app/products/services/products.service';
import { LoadingComponent } from "src/app/shared/components/loading/loading.component";
import { ImageCarruselComponent } from "src/app/shared/components/image-carrusel/image-carrusel.component";
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-product',
  imports: [CommonModule, LoadingComponent, ImageCarruselComponent],
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

    const primary = (product.imagesName ?? []).filter((img) => !!img);
    const fallback = (product as any)?.images ?? [];
    const source = primary.length ? primary : Array.isArray(fallback) ? fallback : [];

    const urls = source
      .filter((img: string) => !!img)
      .map((img: string) => this.mapToImageUrl(img));

    return urls.length ? urls : ['assets/images/default-image.jpg'];
  }

  private mapToImageUrl(value: string): string {
    if (!value) return 'assets/images/default-image.jpg';
    if (/^https?:\/\//.test(value)) return value;
    if (value.startsWith('assets/')) return value;
    return `${this.baseUrl}/files/product/${value}`;
  }
}

