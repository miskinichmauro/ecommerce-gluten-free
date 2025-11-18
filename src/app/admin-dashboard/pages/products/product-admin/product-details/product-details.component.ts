import { ChangeDetectorRef, Component, HostListener, inject, input, OnInit, signal } from '@angular/core';
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
import { TagService } from 'src/app/tags/services/tag.service';
import { Tag } from 'src/app/tags/interfaces/tag.interface';
import { FilesService } from '@shared/services/files.service';
import { environment } from 'src/environments/environment';
import { XCircle } from '@shared/components/x-circle/x-circle';

type PendingImage = { file: File; preview: string };
type ImageSource = { src: string; type: 'existing' | 'local'; identifier: string };

@Component({
  selector: 'product-details',
  imports: [ReactiveFormsModule, FormErrorLabelComponent, XCircle],
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
  tagService = inject(TagService);
  cdr = inject(ChangeDetectorRef);

  private readonly defaultCategory: Category = { id: 'default-sin-gluten', name: 'Sin Gluten' };

  fb = inject(FormBuilder);
  productForm = this.fb.group({
    title: ['', Validators.required],
    slug: ['', [Validators.required, Validators.pattern(FormUtils.slugPattern)]],
    unitOfMeasure: ['', [Validators.required]],
    description: ['', Validators.required],
    price: [1, [Validators.required, Validators.min(1)]],
    stock: [1, [Validators.required, Validators.min(1)]],
    categoryId: ['', Validators.required],
    tags: this.fb.nonNullable.control<string[]>([]),
    imagesName: this.fb.nonNullable.control<string[]>([]),
  });

  categories = signal<Category[]>([]);
  tagsList = signal<Tag[]>([]);
  loadingCategories = signal(false);
  loadingTags = signal(false);
  selectedCategoryId = signal<string | null>(null);
  uploadingImages = false;
  imageUploadError: string | null = null;
  previewImage: string | null = null;
  pendingImages: PendingImage[] = [];
  imageSourceList: ImageSource[] = [];

  ngOnInit(): void {
    this.productForm.reset(this.product());
    this.syncInitialImagesAndTags();
    this.loadCategories();
    this.loadTags();
  }

  private loadCategories() {
    this.loadingCategories.set(true);
    this.categoryService.getAll().subscribe({
      next: categories => {
        this.categories.set(categories.length ? categories : [this.defaultCategory]);
        this.loadingCategories.set(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.categories.set([this.defaultCategory]);
        this.loadingCategories.set(false);
        this.cdr.detectChanges();
      },
      complete: () => {
        this.loadingCategories.set(false);
      }
    });
  }

  private loadTags() {
    this.loadingTags.set(true);
    this.tagService.getAll().subscribe({
      next: tags => {
        this.tagsList.set(tags);
        this.loadingTags.set(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.tagsList.set([]);
        this.loadingTags.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  private syncInitialImagesAndTags() {
    const product = this.product();
    const images = this.mapProductImages(product);
    const tags = (product?.tags ?? []).filter((tag) => !!tag);
    const categoryId = (product as any)?.category?.id ?? '';

    this.productForm.patchValue({
      imagesName: images,
      tags,
      categoryId,
    });
    this.selectedCategoryId.set(categoryId || null);
    this.refreshImageSources();
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

    this.imageUploadError = null;

    Array.from(files).forEach(file => {
      const preview = URL.createObjectURL(file);
      this.pendingImages.push({ file, preview });
    });

    input.value = '';
    this.refreshImageSources();
  }

  removeImage(image: string) {
    const remaining = this.imageNames().filter((img) => img !== image);
    this.imagesNameControl?.setValue(remaining);
    this.imagesNameControl?.markAsDirty();
    this.refreshImageSources();
  }

  removePendingImage(preview: string) {
    const idx = this.pendingImages.findIndex((img) => img.preview === preview);
    if (idx >= 0) {
      URL.revokeObjectURL(this.pendingImages[idx].preview);
      this.pendingImages.splice(idx, 1);
      this.refreshImageSources();
    }
  }

  private updatePreviewImage() {
    if (!this.imageSourceList.length) {
      this.previewImage = null;
      return;
    }

    if (this.previewImage && this.imageSourceList.some((src) => src.src === this.previewImage)) {
      return;
    }

    this.previewImage = this.imageSourceList[0]?.src ?? null;
  }

  private refreshImageSources() {
    const existing = this.imageNames().map<ImageSource>((name) => ({
      src: this.mapExistingImageToUrl(name),
      type: 'existing',
      identifier: name,
    }));

    const locals = this.pendingImages.map<ImageSource>((img) => ({
      src: img.preview,
      type: 'local',
      identifier: img.preview,
    }));

    this.imageSourceList = [...locals, ...existing];
    this.updatePreviewImage();
  }

  private mapExistingImageToUrl(name: string): string {
    if (!name) return 'assets/images/default-image.jpg';
    if (/^https?:\/\//.test(name)) return name;
    if (name.startsWith('assets/')) return name;
    return `${environment.baseUrl}/files/product/${name}`;
  }

  setPreviewImage(image: string) {
    this.previewImage = image;
  }

  selectCategory(category: Category) {
    this.selectedCategoryId.set(category.id);
    this.productForm.get('categoryId')?.setValue(category.id);
  }

  isCategorySelected(category: Category) {
    return this.selectedCategoryId() === category.id;
  }

  imageSources(): ImageSource[] {
    return this.imageSourceList;
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

  private async uploadPendingImages(): Promise<string[]> {
    if (!this.pendingImages.length) return [];
    this.uploadingImages = true;
    try {
      const uploads$ = this.pendingImages.map((item) => this.filesService.uploadProductImage(item.file));
      const uploaded = await firstValueFrom(forkJoin(uploads$));
      const valid = uploaded.filter((name) => !!name) as string[];
      if (!valid.length) {
        this.imageUploadError = 'No se pudo subir la imagen seleccionada.';
      }
      return valid;
    } catch {
      this.imageUploadError = 'Error al subir la imagen. Intenta nuevamente.';
      return [];
    } finally {
      this.uploadingImages = false;
    }
  }

  async onSubmit() {
    this.productForm.markAllAsTouched();
    this.imageUploadError = null;

    const uploadedNames = await this.uploadPendingImages();
    if (uploadedNames.length) {
      const images = [...this.imageNames(), ...uploadedNames];
      this.imagesNameControl?.setValue(images);
      this.imagesNameControl?.markAsDirty();
    }

    if (!this.imageNames().length) {
      this.imageUploadError = 'Primero sube al menos una imagen del producto.';
      return;
    }

    this.pendingImages.forEach(img => URL.revokeObjectURL(img.preview));
    this.pendingImages = [];
    this.refreshImageSources();

    const formValue = this.productForm.value;
    const imagesName = (formValue.imagesName ?? []).filter((name) => !!name);
    const tags = (formValue.tags ?? []).filter((tag) => !!tag);
    const slug = formValue.slug && formValue.slug.length ? formValue.slug : this.generateSlug(formValue.title ?? '');

    const productData: Partial<Product> = {
      ...(formValue as any),
      slug,
      images: imagesName,
      categoryId: formValue.categoryId,
    };
    delete (productData as any).imagesName;
    delete (productData as any).tags;

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
