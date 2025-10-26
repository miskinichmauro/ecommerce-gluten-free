import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Product } from 'src/app/products/interfaces/product';
import { ProductService } from 'src/app/products/services/products.service';
import { LoadingComponent } from "src/app/shared/components/loading/loading.component";
import { ImageCarruselComponent } from "src/app/shared/components/image-carrusel/image-carrusel.component";

@Component({
  selector: 'app-product',
  imports: [CommonModule, LoadingComponent, ImageCarruselComponent],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);

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
}

