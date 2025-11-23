import { ChangeDetectorRef, Component, HostListener, OnDestroy, inject, input, OnInit, signal } from '@angular/core';
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
import { ImageGalleryComponent } from 'src/app/shared/components/image-gallery/image-gallery.component';

type PendingImage = { file: File; preview: string };
type ImageSource = { src: string; type: 'existing' | 'local'; identifier: string };

@Component({
  selector: 'product-details',
  imports: [ReactiveFormsModule, FormErrorLabelComponent, ImageGalleryComponent],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
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
    description: ['', Validators.required],
    price: [1, [Validators.required, Validators.min(1)]],
    stock: [1, [Validators.required, Validators.min(1)]],
    isFeatured: [false],
    categoryId: ['', Validators.required],
    tags: this.fb.nonNullable.control<string[]>([]),
    imageIds: this.fb.nonNullable.control<string[]>([]),
  });

  categories = signal<Category[]>([]);
  tagsList = signal<Tag[]>([]);
  loadingCategories = signal(false);
  loadingTags = signal(false);
  selectedCategoryId = signal<string | null>(null);
  uploadingImages = signal(false);
  imageUploadError: string | null = null;
  previewImage: string | null = null;
  pendingImages: PendingImage[] = [];
  imageSourceList: ImageSource[] = [];
  private uploadedPreviewMap = new Map<string, string>();
  currentSlide = signal<number>(0);

  ngOnInit(): void {
    this.initializeFormFromProduct();
    this.loadCategories();
    this.loadTags();
  }

  ngOnDestroy(): void {
    this.cleanupObjectUrls();
  }

  private initializeFormFromProduct() {
    const product = this.product();
    const images = this.mapProductImageIds(product);
    const tags = this.extractTagNames(product?.tags);
    const categoryId = (product as any)?.category.id ?? '';

    this.productForm.reset({
      title: product?.title ?? '',
      slug: product?.slug ?? '',
      description: product?.description ?? '',
      price: product?.price ?? 1,
      stock: product?.stock ?? 1,
      isFeatured: product?.isFeatured ?? false,
      categoryId,
      tags,
      imageIds: images,
    });
    this.selectedCategoryId.set(categoryId || null);
    this.refreshImageSources();
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

  private mapProductImageIds(product: Product | null): string[] {
    if (!product) return [];
    if (Array.isArray(product.imageIds) && product.imageIds.length) {
      return product.imageIds.filter((img) => !!img);
    }
    const rawImages = Array.isArray(product.images) ? product.images : [];
    return rawImages
      .map((img) => this.resolveImageIdentifier(img))
      .filter((img): img is string => !!img);
  }

  private resolveImageIdentifier(image: unknown): string | null {
    if (!image) return null;
    if (typeof image === 'string') return this.normalizeImageIdentifier(image);
    if (typeof image === 'object') {
      const candidate =
        (image as any).id ||
        (image as any).name ||
        (image as any).fileName ||
        (image as any).filename ||
        (image as any).path ||
        (image as any).secureUrl ||
        (image as any).url;
      return typeof candidate === 'string' ? this.normalizeImageIdentifier(candidate) : null;
    }
    return null;
  }

  private normalizeImageIdentifier(value: string): string {
    if (!value) return '';
    const cleanValue = value.split('?')[0];
    const normalized = cleanValue.replace(/\\/g, '/');
    const isAsset = normalized.startsWith('assets/');
    const needsSplit = /^https?:\/\//.test(normalized) || (!isAsset && normalized.includes('/'));
    if (!needsSplit) {
      return normalized;
    }
    const segments = normalized.split('/');
    return segments.pop() ?? normalized;
  }

  private extractTagNames(rawTags: Product['tags'] | undefined): string[] {
    if (!rawTags) return [];
    return (rawTags as Array<string | { name?: string }>).map((tag) => {
      if (typeof tag === 'string') return tag;
      return tag?.name ?? '';
    }).filter((tag) => !!tag);
  }

  get imageIdsControl() {
    return this.productForm.get('imageIds');
  }

  currentImageIds(): string[] {
    return (this.imageIdsControl?.value as string[]) ?? [];
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
    const remaining = this.currentImageIds().filter((img) => img !== image);
    this.imageIdsControl?.setValue(remaining);
    this.imageIdsControl?.markAsDirty();
    const tempPreview = this.uploadedPreviewMap.get(image);
    if (tempPreview) {
      URL.revokeObjectURL(tempPreview);
      this.uploadedPreviewMap.delete(image);
    }
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
      this.currentSlide.set(0);
      return;
    }

    const existingIdx = this.imageSourceList.findIndex((src) => src.src === this.previewImage);
    const nextIdx = existingIdx >= 0 ? existingIdx : 0;
    this.previewImage = this.imageSourceList[nextIdx]?.src ?? null;
    this.currentSlide.set(nextIdx);
  }

  private refreshImageSources() {
    const existing = this.currentImageIds().map<ImageSource>((name) => ({
      src: this.uploadedPreviewMap.get(name) ?? this.mapExistingImageToUrl(name),
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

  onGallerySlideChange(idx: number) {
    this.currentSlide.set(idx);
    this.previewImage = this.imageSourceList[idx]?.src ?? this.previewImage;
  }

  onGalleryRemove(identifier: string) {
    const target = this.imageSourceList.find((img) => img.identifier === identifier);
    if (!target) return;
    if (target.type === 'existing') {
      this.removeImage(identifier);
    } else {
      this.removePendingImage(identifier);
    }
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
    this.uploadingImages.set(true);
    try {
      const batch = [...this.pendingImages];
      const uploads$ = batch.map((item) => this.filesService.uploadProductImage(item.file));
      const uploaded = await firstValueFrom(forkJoin(uploads$));
      const successful = uploaded
        .map((name, idx) => ({
          name: (name ?? '').toString().trim(),
          preview: batch[idx]?.preview,
        }))
        .filter((item) => !!item.name) as Array<{ name: string; preview: string }>;

      if (!successful.length) {
        this.imageUploadError = 'No se pudo subir la imagen seleccionada.';
      }

      const previewsToRemove = new Set(successful.map(({ preview }) => preview));
      this.pendingImages = this.pendingImages.filter((img) => !previewsToRemove.has(img.preview));
      successful.forEach(({ name, preview }) => {
        if (preview) {
          this.uploadedPreviewMap.set(name, preview);
        }
      });
      return successful.map(({ name }) => name);
    } catch {
      this.imageUploadError = 'Error al subir la imagen. Intenta nuevamente.';
      return [];
    } finally {
      this.uploadingImages.set(false);
    }
  }

  async onSubmit() {
    this.productForm.markAllAsTouched();
    this.imageUploadError = null;

    const uploadedNames = await this.uploadPendingImages();
    if (uploadedNames.length) {
      const images = [...this.currentImageIds(), ...uploadedNames];
      this.imageIdsControl?.setValue(images);
      this.imageIdsControl?.markAsDirty();
    }

    this.refreshImageSources();

    if (!this.currentImageIds().length) {
      this.imageUploadError = 'Primero sube al menos una imagen del producto.';
      return;
    }

    const formValue = this.productForm.value;
    const imageIds = (formValue.imageIds ?? []).filter((name) => !!name);
    const tags = this.extractTagNames(formValue.tags);
    const slug = formValue.slug && formValue.slug.length ? formValue.slug : this.generateSlug(formValue.title ?? '');

    const productData: Partial<Product> = {
      ...(formValue as any),
      slug,
      imageIds,
      categoryId: formValue.categoryId,
      isFeatured: !!formValue.isFeatured,
    };
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

  private cleanupObjectUrls() {
    this.pendingImages.forEach(img => URL.revokeObjectURL(img.preview));
    this.pendingImages = [];
    this.uploadedPreviewMap.forEach((url) => URL.revokeObjectURL(url));
    this.uploadedPreviewMap.clear();
  }
}
