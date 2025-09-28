import { Component, effect, inject, Signal } from '@angular/core';
import { PaginationService } from 'src/app/shared/components/pagination/pagination.service';
import { useProductsLoader } from 'src/app/shared/composables/useProductsLoader';
import { ProductCardComponent } from "src/app/products/components/product-card/product-card.component";
import { PaginationComponent } from "src/app/shared/components/pagination/pagination.component";
@Component({
  selector: 'app-products',
  imports: [ProductCardComponent, PaginationComponent],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent {
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
