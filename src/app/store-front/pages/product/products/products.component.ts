import { Component, inject, signal, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationService } from 'src/app/shared/components/pagination/pagination.service';
import { useProductsLoader } from 'src/app/shared/composables/useProductsLoader';
import { ProductCardComponent } from "src/app/products/components/product-card/product-card.component";
import { PaginationComponent } from "src/app/shared/components/pagination/pagination.component";
import { ProductResponse } from 'src/app/products/interfaces/product';
import { LoadingComponent } from "src/app/shared/components/loading/loading.component";
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from 'src/app/categories/services/category.service';
import { TagService } from 'src/app/tags/services/tag.service';
import { Category } from 'src/app/categories/interfaces/category.interface';
import { Tag } from 'src/app/tags/interfaces/tag.interface';

@Component({
  selector: 'app-products',
  imports: [CommonModule, ProductCardComponent, PaginationComponent, LoadingComponent, ReactiveFormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly paginationService = inject(PaginationService);
  private categoryService = inject(CategoryService);
  private tagService = inject(TagService);

  productResponse: Signal<ProductResponse | null>;
  loading: Signal<boolean>;
  error: Signal<any>;
  loadProducts: (params: ProductOptions) => Promise<void>;

  searchControl = new FormControl('');
  private lastQuery = '';
  productPerPage = signal(8);
  categories = signal<Category[]>([]);
  tags = signal<Tag[]>([]);
  selectedCategory = signal<string>('all');
  pendingCategory = signal<string>('all');
  selectedTags = signal<Set<string>>(new Set());
  pendingTags = signal<Set<string>>(new Set());
  hasPendingChanges = computed(() => {
    if (this.selectedCategory() !== this.pendingCategory()) return true;
    const applied = this.selectedTags();
    const pending = this.pendingTags();
    if (applied.size !== pending.size) return true;
    for (const tag of pending) {
      if (!applied.has(tag)) return true;
    }
    return false;
  });

  constructor() {
    const { productResponse, loading, error, loadProducts } = useProductsLoader();
    this.productResponse = productResponse;
    this.loading = loading;
    this.error = error;
    this.loadProducts = loadProducts;

    this.loadFilters();

    this.route.queryParamMap.subscribe((params) => {
      const q = params.get('q') ?? '';
      this.lastQuery = q;
      const categoryId = params.get('categoryId') ?? 'all';
      const tagIdsParam = params.get('tagIds') ?? '';
      const tagIds = tagIdsParam ? tagIdsParam.split(',').filter(Boolean) : [];

      if (this.searchControl.value !== q) {
        this.searchControl.setValue(q, { emitEvent: false });
      }

      this.selectedCategory.set(categoryId);
      this.pendingCategory.set(categoryId);
      const tagSet = new Set(tagIds);
      this.selectedTags.set(tagSet);
      this.pendingTags.set(new Set(tagSet));

      const perPage = this.productPerPage();
      const offset = (this.paginationService.currentPage() - 1) * perPage;
      this.loadProducts({ query: q, offset, limit: perPage, categoryId: this.categoryIdForRequest(), tagIds: this.tagIdsForRequest() });
      this.loadTagsForCategory(this.pendingCategoryForRequest());
    });

    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(q => {
        const qValue = q?.trim() ?? '';

        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { q: qValue || null },
          queryParamsHandling: 'merge',
        });

        this.paginationService.resetPage();
      });
  }

  updateProductsPerPage(value: number) {
    this.productPerPage.set(value);
    this.paginationService.setCurrentPage(1);
    this.loadProducts({
      query: this.lastQuery,
      offset: 0,
      limit: this.productPerPage(),
      categoryId: this.categoryIdForRequest(),
      tagIds: this.tagIdsForRequest(),
    });
  }

  async loadFilters() {
    this.categoryService.getAll().subscribe((categories) => this.categories.set(categories));
    this.loadTagsForCategory(this.categoryIdForRequest());
  }

  selectCategory(id: string) {
    const nextCategory = this.pendingCategory() === id ? 'all' : id;
    this.pendingCategory.set(nextCategory);
    this.pendingTags.set(new Set());
    this.loadTagsForCategory(this.pendingCategoryForRequest());
  }

  resetTags() {
    this.selectedTags.set(new Set());
    this.pendingTags.set(new Set());
    this.paginationService.setCurrentPage(1);
    this.updateQueryParams();
  }

  toggleTag(id: string) {
    const current = new Set(this.pendingTags());
    if (current.has(id)) current.delete(id); else current.add(id);
    this.pendingTags.set(current);
  }

  applyFilters() {
    this.selectedCategory.set(this.pendingCategory());
    this.selectedTags.set(new Set(this.pendingTags()));
    this.paginationService.setCurrentPage(1);
    this.updateQueryParams();
  }

  updateQueryParams() {
    const tags = Array.from(this.selectedTags());
    this.router.navigate(['/products'], {
      queryParams: {
        q: this.lastQuery || null,
        categoryId: this.selectedCategory() === 'all' ? null : this.selectedCategory(),
        tagIds: tags.length ? tags.join(',') : null,
      },
      queryParamsHandling: 'merge',
    });
  }

  private loadTagsForCategory(categoryId?: string | undefined) {
    this.tagService.getAll(categoryId).subscribe((tags) => {
      this.tags.set(tags);
      this.selectedTags.set(new Set());
      this.pendingTags.set(new Set());
    });
  }

  private categoryIdForRequest(): string | undefined {
    return this.selectedCategory() === 'all' ? undefined : this.selectedCategory();
  }

  private pendingCategoryForRequest(): string | undefined {
    return this.pendingCategory() === 'all' ? undefined : this.pendingCategory();
  }

  private tagIdsForRequest(): string[] | undefined {
    const tags = Array.from(this.selectedTags());
    return tags.length ? tags : undefined;
  }
}
