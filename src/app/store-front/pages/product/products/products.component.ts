import { Component, effect, inject, signal, Signal } from '@angular/core';
import { PaginationService } from 'src/app/shared/components/pagination/pagination.service';
import { useProductsLoader } from 'src/app/shared/composables/useProductsLoader';
import { ProductCardComponent } from "src/app/products/components/product-card/product-card.component";
import { PaginationComponent } from "src/app/shared/components/pagination/pagination.component";
import { ProductResponse } from 'src/app/products/interfaces/product';
import { LoadingComponent } from "src/app/shared/components/loading/loading.component";
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-products',
  imports: [ProductCardComponent, PaginationComponent, LoadingComponent, ReactiveFormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly paginationService = inject(PaginationService);

  productResponse: Signal<ProductResponse | null>;
  loading: Signal<boolean>;
  error: Signal<any>;
  loadProducts: (params: ProductOptions) => Promise<void>;

  searchControl = new FormControl('');
  private lastQuery = '';
  productPerPage = signal(8);

  constructor() {
    const { productResponse, loading, error, loadProducts } = useProductsLoader();
    this.productResponse = productResponse;
    this.loading = loading;
    this.error = error;
    this.loadProducts = loadProducts;

    this.route.queryParamMap.subscribe((params) => {
      const q = params.get('q') ?? '';
      this.lastQuery = q;

      if (this.searchControl.value !== q) {
        this.searchControl.setValue(q, { emitEvent: false });
      }

      const perPage = this.productPerPage();
      const offset = (this.paginationService.currentPage() - 1) * perPage;
      this.loadProducts({ query: q, offset, limit: perPage });
    });

    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(q => {
        const qValue = q?.trim() ?? '';

        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { q: qValue || null },
          queryParamsHandling: 'merge',
        });

        this.paginationService.resetPage();
        this.loadProducts({ query: qValue, offset: 0, limit: this.productPerPage() });
      });

    effect(() => {
      const perPage = this.productPerPage();
      const offset = (this.paginationService.currentPage() - 1) * perPage;
      this.loadProducts({ query: this.lastQuery, offset, limit: perPage });
    });
  }

  updateProductsPerPage(value: number) {
    this.productPerPage.set(value);
    this.paginationService.setCurrentPage(1);
  }
}
