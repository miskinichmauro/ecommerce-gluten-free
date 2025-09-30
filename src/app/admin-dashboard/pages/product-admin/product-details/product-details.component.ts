import { Component, inject, input, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from 'src/app/products/interfaces/product';
import { FormUtils } from 'src/app/utils/form-utils';

@Component({
  selector: 'product-details',
  imports: [ReactiveFormsModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent implements OnInit {
  product = input.required<Product>();

  fb = inject(FormBuilder);
  productForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    slug: ['', [Validators.required, Validators.pattern(FormUtils.slugPattern)]],
    price: [1, [Validators.required, Validators.min(1)]],
    stock: [1, [Validators.required, Validators.min(1)]],
    tags: [['']],
    images: [[]],
  });

  tags = ['Cerveza', 'Harina', 'Salado', 'Dulce']

  ngOnInit(): void {
    this.productForm.reset(this.product());
  }

  onSubmit() {
    console.log(this.productForm.value);
  }
}
