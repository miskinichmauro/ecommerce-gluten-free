import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Product } from 'src/app/products/interfaces/product';
import { ProductService } from 'src/app/products/services/products.service';
import { ProductCarruselComponent } from "src/app/products/components/product-carrusel/product-carrusel.component";

@Component({
  selector: 'app-product',
  imports: [CommonModule, ProductCarruselComponent],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);

  productIdSlug = this.activatedRoute.snapshot.params['idSlug'];

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
      const data = await firstValueFrom(this.productService.getProductByIdSlug(this.productIdSlug));
      this.product.set(data);
    } catch (err) {
      console.error(err);
      this.error.set('Error al cargar el producto');
    } finally {
      this.loading.set(false);
    }
  }

  get productImages(): string[] {
    const images = this.product()?.imagesName ?? [];
    return images?.length > 0
      ? images
      : ['https://www.foodnavigator.com/resizer/v2/3MET5T7L4JO25FVOXQDQ67EHOE.jpg?auth=d16d65b4d7f1ff6620ee4d54a2abb29750e275e5721fcd954f2aecd5a78ab6f7&smart=true'];;
  }
}

