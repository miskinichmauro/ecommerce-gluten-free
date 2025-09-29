import { Component, effect, inject, Signal } from '@angular/core';
import { ProductsTableComponent } from 'src/app/products/components/products-table/products-table.component';
import { PaginationService } from 'src/app/shared/components/pagination/pagination.service';
import { useProductsLoader } from 'src/app/shared/composables/useProductsLoader';
import { PaginationComponent } from "src/app/shared/components/pagination/pagination.component";

@Component({
  selector: 'app-products-admin',
  imports: [ProductsTableComponent, PaginationComponent],
  templateUrl: './products-admin.component.html',
  styleUrl: './products-admin.component.css',
})
export class ProductsAdminComponent {
  readonly paginationService = inject(PaginationService);

  productResponse: Signal<any>;
  loading: Signal<boolean>;
  error: Signal<any>;
  loadProducts: (params?: any) => Promise<void>;

  constructor() {
    const { productResponse, loading, error, loadProducts } = useProductsLoader();

    this.productResponse = productResponse;
    this.loading = loading;
    this.error = error;
    this.loadProducts = loadProducts;

    effect(() => {
      this.loadProducts({ offset: (this.paginationService.currentPage() - 1) * 9 });
    });
  }
}
