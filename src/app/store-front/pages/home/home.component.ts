import { Component, effect, Signal } from '@angular/core';
import { useProductsLoader } from 'src/app/shared/composables/useProductsLoader';
import { ProductCarruselComponent } from "src/app/products/components/product-carrusel/product-carrusel.component";
import { ProductResponse } from 'src/app/products/interfaces/product';
import { LoadingComponent } from "src/app/shared/components/loading/loading.component";
@Component({
  selector: 'app-home',
  imports: [ProductCarruselComponent, LoadingComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  productResponse: Signal<ProductResponse | null>;
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
      this.loadProducts({ isFeatured: true });
    });
  }
}
