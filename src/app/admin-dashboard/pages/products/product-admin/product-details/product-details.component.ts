import { Component, HostListener, inject, input, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from 'src/app/products/interfaces/product';
import { FormUtils } from 'src/app/utils/form-utils';
import { FormErrorLabelComponent } from "src/app/shared/components/form-error-label/form-error-label.component";
import { ProductService } from 'src/app/products/services/products.service';
import { Router } from '@angular/router';
import { ConfigurationService } from 'src/app/shared/services/configuration.service';

@Component({
  selector: 'product-details',
  imports: [ReactiveFormsModule, FormErrorLabelComponent],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent implements OnInit {
  product = input.required<Product>();

  router = inject(Router);
  productsService = inject(ProductService);
  configurationService = inject(ConfigurationService);

  fb = inject(FormBuilder);
  productForm = this.fb.group({
    title: ['', Validators.required],
    slug: ['', [Validators.required, Validators.pattern(FormUtils.slugPattern)]],
    unitOfMeasure: ['', [Validators.required]],
    description: ['', Validators.required],
    price: [1, [Validators.required, Validators.min(1)]],
    stock: [1, [Validators.required, Validators.min(1)]],
    tags: [['']],
    imagesName: [['']],
  });

  tags = ['Cerveza', 'Harina', 'Salado', 'Dulce']

  ngOnInit(): void {
    this.productForm.reset(this.product());
  }

  isTagSelected(tag: string): boolean {
    const tags: string[] = this.productForm.value.tags || [];
    return tags.some(t => t.toLowerCase() === tag.toLowerCase());
  }

  onTagsClicked (tag: string) {
    const tagLower = tag.toLowerCase();
    const currentTags = this.productForm.value.tags ?? [];

    if (currentTags.includes(tagLower)) {
      currentTags.splice(currentTags.indexOf(tagLower), 1)
    } else {
      currentTags.push(tagLower);
    }

    this.productForm.patchValue({ tags: currentTags });
  }

  onSubmit() {
    this.configurationService.loading.set(true);

    this.productForm.markAllAsTouched();
    const formValue = this.productForm.value;

    const productData: Partial<Product> = {
      ... (formValue as any)
    };

    if (this.product().id === 'new') {
      this.productsService.createProduct(productData).subscribe(async () => {
        await this.configurationService.toggleToast();
      });
    } else {
      this.productsService.updateProduct(this.product().id, productData).subscribe(async () => {
        await this.configurationService.toggleToast();
      });
    }
    this.router.navigate(['/admin/products'])
  }

  controlPresionado: boolean = false;
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Control') {
      this.controlPresionado = true;
    } else if (event.key === 'Enter' && this.controlPresionado) {
      this.onSubmit();
    }
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyboardUp(event: KeyboardEvent) {
    if (event.key === 'Control') {
      this.controlPresionado = false;
    }
  }
}
