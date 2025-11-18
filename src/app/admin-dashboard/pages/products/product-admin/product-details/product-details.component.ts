import { Component, HostListener, inject, input, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from 'src/app/products/interfaces/product';
import { FormUtils } from 'src/app/utils/form-utils';
import { FormErrorLabelComponent } from "src/app/shared/components/form-error-label/form-error-label.component";
import { ProductService } from 'src/app/products/services/products.service';
import { Router } from '@angular/router';
import { ConfigurationService } from 'src/app/shared/services/configuration.service';
import { firstValueFrom, forkJoin } from 'rxjs';
import { CategoryService } from 'src/app/categories/services/category.service';
import { Category } from 'src/app/categories/interfaces/category.interface';
import { FilesService } from '@shared/services/files.service';
import { ProductImagePipe } from '@products/pipes/product-image.pipe';

@Component({
  selector: 'product-details',
  imports: [ReactiveFormsModule, FormErrorLabelComponent, ProductImagePipe],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent implements OnInit {
  product = input.required<Product>();

  router = inject(Router);
  productsService = inject(ProductService);
  configurationService = inject(ConfigurationService);
  categoryService = inject(CategoryService);
  filesService = inject(FilesService);

  private readonly defaultCategory: Category = { id: 'default-sin-gluten', name: 'Sin Gluten' };

  fb = inject(FormBuilder);
  productForm = this.fb.group({
    title: ['', Validators.required],
    slug: ['', [Validators.required, Validators.pattern(FormUtils.slugPattern)]],
    unitOfMeasure: ['', [Validators.required]],
    description: ['', Validators.required],
    price: [1, [Validators.required, Validators.min(1)]],
    stock: [1, [Validators.required, Validators.min(1)]],
    tags: this.fb.nonNullable.control<string[]>([]),
    imagesName: this.fb.nonNullable.control<string[]>([]),
  });

  categories: Category[] = [];
  loadingCategories = false;
  uploadingImages = false;
  imageUploadError: string | null = null;

  ngOnInit(): void {
    this.productForm.reset(this.product());
    this.syncInitialImagesAndTags();
    this.loadCategories();
  }

  private loadCategories() {
    this.loadingCategories = true;
    this.categoryService.getAll().subscribe({
      next: categories => {
        this.categories = categories.length ? categories : [this.defaultCategory];
      },
      error: () => {
        this.categories = [this.defaultCategory];
        this.loadingCategories = false;
      },
      complete: () => {
        this.loadingCategories = false;
      }
    });
  }

  private syncInitialImagesAndTags() {
    const product = this.product();
    const images = this.mapProductImages(product);
    const tags = (product?.tags ?? []).filter((tag) => !!tag);

    this.productForm.patchValue({
      imagesName: images,
      tags,
    });
  }

  private mapProductImages(product: Product | null): string[] {
    if (!product) return [];
    const imageNames = (product.imagesName ?? []).filter((img) => !!img);
    if (imageNames.length) return imageNames;
    const imageUrls = (product as any)?.images ?? [];
    if (!Array.isArray(imageUrls)) return [];
    return imageUrls
      .filter((url: string) => !!url)
      .map((url: string) => {
        if (/^https?:\/\//.test(url)) {
          const segments = url.split('/');
          return segments.at(-1) ?? url;
        }
        return url;
      });
  }

  get imagesNameControl() {
    return this.productForm.get('imagesName');
  }

  imageNames(): string[] {
    return (this.imagesNameControl?.value as string[]) ?? [];
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;

    this.uploadingImages = true;
    this.imageUploadError = null;

    const uploads$ = Array.from(files).map((file) => this.filesService.uploadProductImage(file));

    forkJoin(uploads$).subscribe({
      next: (uploadedNames) => {
        const validNames = uploadedNames.filter((name) => !!name);
        if (!validNames.length) {
          this.imageUploadError = 'No se pudo subir la imagen seleccionada.';
          return;
        }
        const updated = [...this.imageNames(), ...validNames];
        this.imagesNameControl?.setValue(updated);
        this.imagesNameControl?.markAsDirty();
      },
      error: () => {
        this.imageUploadError = 'Error al subir la imagen. Intenta nuevamente.';
        this.uploadingImages = false;
        if (input) {
          input.value = '';
        }
      },
      complete: () => {
        this.uploadingImages = false;
        if (input) {
          input.value = '';
        }
      }
    });
  }

  removeImage(image: string) {
    const remaining = this.imageNames().filter((img) => img !== image);
    this.imagesNameControl?.setValue(remaining);
    this.imagesNameControl?.markAsDirty();
  }

  isTagSelected(tag: string): boolean {
    const tags: string[] = (this.productForm.get('tags')?.value as string[]) ?? [];
    return tags.some(t => t.toLowerCase() === tag.toLowerCase());
  }

  onTagsClicked (tag: string) {
    const tagLower = tag.toLowerCase();
    const currentTags = [...((this.productForm.get('tags')?.value as string[]) ?? [])];

    if (currentTags.includes(tagLower)) {
      currentTags.splice(currentTags.indexOf(tagLower), 1)
    } else {
      currentTags.push(tagLower);
    }

    this.productForm.get('tags')?.setValue(currentTags);
  }

  async onSubmit() {
    this.productForm.markAllAsTouched();
    if (!this.imageNames().length) {
      this.imageUploadError = 'Primero sube al menos una imagen del producto.';
      return;
    }

    const formValue = this.productForm.value;
    const imagesName = (formValue.imagesName ?? []).filter((name) => !!name);
    const tags = (formValue.tags ?? []).filter((tag) => !!tag);
    const slug = formValue.slug && formValue.slug.length ? formValue.slug : this.generateSlug(formValue.title ?? '');

    const productData: Partial<Product> = {
      ...(formValue as any),
      slug,
      imagesName,
      tags,
    };

    if (this.product().id === 'new') {
      await firstValueFrom(this.productsService.createProduct(productData));
    } else {
      await firstValueFrom(this.productsService.updateProduct(this.product().id, productData));
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

  private generateSlug(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');
  }
}
