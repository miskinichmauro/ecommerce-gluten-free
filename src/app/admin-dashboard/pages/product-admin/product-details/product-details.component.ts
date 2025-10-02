import { Component, inject, input, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from 'src/app/products/interfaces/product';
import { FormUtils } from 'src/app/utils/form-utils';
import { FormErrorLabelComponent } from "src/app/shared/components/form-error-label/form-error-label.component";
import { ProductService } from 'src/app/products/services/products.service';

@Component({
  selector: 'product-details',
  imports: [ReactiveFormsModule, FormErrorLabelComponent],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent implements OnInit {
  product = input.required<Product>();
  productsService = inject(ProductService);

  fb = inject(FormBuilder);
  productForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    slug: ['', [Validators.required, Validators.pattern(FormUtils.slugPattern)]],
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
    this.productForm.markAllAsTouched();
    const formValue = this.productForm.value;

    const productData: Partial<Product> = {
      ... (formValue as any)
    };

    this.productsService.updateProduct(this.product().id, productData).subscribe(
      product => {
        console.log('Producto actualizado')
      }
    );
  }
}
