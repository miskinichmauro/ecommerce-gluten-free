import { Component, effect, Signal } from '@angular/core';
import { useProductsLoader } from 'src/app/shared/composables/useProductsLoader';
import { ProductCarruselComponent } from "src/app/products/components/product-carrusel/product-carrusel.component";
@Component({
  selector: 'app-home',
  imports: [ProductCarruselComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
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
      this.loadProducts({ isFeatured: true });
    });
  }
}
