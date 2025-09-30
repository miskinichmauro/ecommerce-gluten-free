import { Component, effect, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { LoadingComponent } from "src/app/shared/components/loading/loading.component";
import { Product } from 'src/app/products/interfaces/product';
import { PaginationService } from 'src/app/shared/components/pagination/pagination.service';
import { useProductByIdSlugLoader } from 'src/app/shared/composables/useProductByIdSlugLoader';
import { ProductDetailsComponent } from "./product-details/product-details.component";

@Component({
  selector: 'app-product-admin',
  imports: [LoadingComponent, ProductDetailsComponent],
  templateUrl: './product-admin.component.html',
  styleUrl: './product-admin.component.css',
})
export class ProductAdminComponent {
  activateRoute = inject(ActivatedRoute);
  router = inject(Router);

  productId = toSignal(
    this.activateRoute.params.pipe(
      map(params => params['id'])
    )
  );

  readonly paginationService = inject(PaginationService);

  product: Signal<Product | null>;
  loading: Signal<boolean>;
  error: Signal<any>;
  loadProducts: (param: string) => Promise<void>;

  constructor() {
    const { product, loading, error, loadProducts } = useProductByIdSlugLoader();

    this.product = product;
    this.loading = loading;
    this.error = error;
    this.loadProducts = loadProducts;

    effect(() => {
      const id = this.productId();
      if (id) {
        this.loadProducts(id);
      }
    });

    effect(() => {
      if (this.error()) {
        this.router.navigate(['/admin/products']);
      }
    });
  }
}
