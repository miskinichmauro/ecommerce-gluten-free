import { Component, effect, inject, Signal } from '@angular/core';
import { useProductsLoader } from 'src/app/shared/composables/useProductsLoader';
import { ProductResponse } from 'src/app/products/interfaces/product';
import { ProductCarruselComponent } from 'src/app/products/components/product-carrusel/product-carrusel.component';
import { RouterLink } from '@angular/router';
import { ProductCardSkeleton } from "@products/components/product-card-skeletor/product-card-skeleton";

@Component({
  selector: 'home-featured-products',
  standalone: true,
  imports: [RouterLink, ProductCarruselComponent, ProductCardSkeleton],
  templateUrl: './home-featured-products.html',
  styleUrl: './home-featured-products.css',
})
export class HomeFeaturedProducts {

  productResponse!: Signal<ProductResponse | null>;
  loading!: Signal<boolean>;
  error!: Signal<any>;

  constructor() {
    const { productResponse, loading, error, loadProducts } = useProductsLoader();

    this.productResponse = productResponse;
    this.loading = loading;
    this.error = error;

    effect(() => {
      loadProducts({ isFeatured: true, limit: 12 });
    });
  }
}
