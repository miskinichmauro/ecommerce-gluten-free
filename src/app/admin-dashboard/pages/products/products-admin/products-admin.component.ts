import { Component, effect, inject, signal, Signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductsTableComponent } from 'src/app/products/components/products-table/products-table.component';
import { PaginationService } from 'src/app/shared/components/pagination/pagination.service';
import { useProductsLoader } from 'src/app/shared/composables/useProductsLoader';
import { PaginationComponent } from "src/app/shared/components/pagination/pagination.component";
import { ProductResponse } from 'src/app/products/interfaces/product';
import { ProductService } from 'src/app/products/services/products.service';

@Component({
  selector: 'products-admin',
  imports: [ProductsTableComponent, PaginationComponent, RouterLink],
  templateUrl: './products-admin.component.html',
  styleUrl: './products-admin.component.css',
})
export class ProductsAdminComponent {
  readonly paginationService = inject(PaginationService);
  private readonly productService = inject(ProductService);

  productResponse: Signal<ProductResponse | null>;
  loading: Signal<boolean>;
  error: Signal<any>;
  loadProducts: (params?: any) => Promise<void>;
  productPerPage = signal(10);

  constructor() {
    const { productResponse, loading, error, loadProducts } = useProductsLoader();

    this.productResponse = productResponse;
    this.loading = loading;
    this.error = error;
    this.loadProducts = loadProducts;

    effect(() => {
      const page = this.paginationService.currentPage();
      const perPage = this.productPerPage();

      const offset = (page - 1) * perPage;
      const limit = perPage;

      this.loadProducts({ offset, limit });
    });
  }

  updateProductsPerPage(value: number) {
    this.productPerPage.set(value);
    this.paginationService.setCurrentPage(1);
  }

  onDeleteProduct(id: string) {
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        const page = this.paginationService.currentPage();
        const perPage = this.productPerPage();
        const offset = (page - 1) * perPage;
        this.loadProducts({ offset, limit: perPage });
      },
      error: () => {
        // error handled by toast service in deleteProduct
      }
    });
  }
}
