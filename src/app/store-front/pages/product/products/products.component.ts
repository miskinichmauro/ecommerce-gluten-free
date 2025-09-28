import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ProductCardComponent } from 'src/app/products/components/product-card/product-card.component';
import { ProductResponse } from 'src/app/products/interfaces/product';
import { ProductService } from 'src/app/products/services/products.service';
import { PaginationComponent } from "src/app/shared/components/pagination/pagination.component";
import { PaginationService } from 'src/app/shared/components/pagination/pagination.service';

@Component({
  selector: 'app-products',
  imports: [
    CommonModule,
    ProductCardComponent,
    PaginationComponent
],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent {
  private readonly productService = inject(ProductService);
  readonly paginationService = inject(PaginationService);

  productResponse = signal<ProductResponse| null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.loadProducts(this.paginationService.currentPage() - 1);
    });
  }

  private async loadProducts(page: number) {
    this.loading.set(true);
    this.error.set(null);

    try {
      const data = await firstValueFrom(this.productService.getProducts({
        offset: page * 9
      }));
      this.productResponse.set(data);
    } catch (err) {
      console.error(err);
      this.error.set('Error al cargar productos');
    } finally {
      this.loading.set(false);
    }
  }
}
