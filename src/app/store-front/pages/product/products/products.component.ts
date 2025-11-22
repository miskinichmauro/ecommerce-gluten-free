import { Component, effect, inject, signal, Signal } from '@angular/core';
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
  imports: [ProductCardComponent, PaginationComponent, LoadingComponent, ReactiveFormsModule],
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
  selectedTags = signal<Set<string>>(new Set());

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
      this.selectedTags.set(new Set(tagIds));

      const perPage = this.productPerPage();
      const offset = (this.paginationService.currentPage() - 1) * perPage;
      this.loadProducts({ query: q, offset, limit: perPage, categoryId: this.categoryIdForRequest(), tagIds: this.tagIdsForRequest() });
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
        this.loadProducts({ query: qValue, offset: 0, limit: this.productPerPage(), categoryId: this.categoryIdForRequest(), tagIds: this.tagIdsForRequest() });
      });

    effect(() => {
      const perPage = this.productPerPage();
      const offset = (this.paginationService.currentPage() - 1) * perPage;
      this.loadProducts({ query: this.lastQuery, offset, limit: perPage, categoryId: this.categoryIdForRequest(), tagIds: this.tagIdsForRequest() });
    });
  }

  updateProductsPerPage(value: number) {
    this.productPerPage.set(value);
    this.paginationService.setCurrentPage(1);
  }

  async loadFilters() {
    this.categoryService.getAll().subscribe((categories) => this.categories.set(categories));
    this.loadTagsForCategory(this.categoryIdForRequest());
  }

  selectCategory(id: string) {
    const nextCategory = this.selectedCategory() === id ? 'all' : id;
    this.selectedCategory.set(nextCategory);
    this.selectedTags.set(new Set()); // reset tags when category changes
    this.loadTagsForCategory(this.categoryIdForRequest());
    this.paginationService.setCurrentPage(1);
    this.updateQueryParams();
  }

  resetTags() {
    this.selectedTags.set(new Set());
    this.paginationService.setCurrentPage(1);
    this.updateQueryParams();
  }

  toggleTag(id: string) {
    const current = new Set(this.selectedTags());
    if (current.has(id)) current.delete(id); else current.add(id);
    this.selectedTags.set(current);
    this.paginationService.setCurrentPage(1);
    this.updateQueryParams();
  }

  updateQueryParams() {
    const tags = Array.from(this.selectedTags());
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.lastQuery || null,
        categoryId: this.selectedCategory() === 'all' ? null : this.selectedCategory(),
        tagIds: tags.length ? tags.join(',') : null,
      },
      queryParamsHandling: 'merge',
    });

    const perPage = this.productPerPage();
    const offset = (this.paginationService.currentPage() - 1) * perPage;
    this.loadProducts({
      query: this.lastQuery,
      offset,
      limit: perPage,
      categoryId: this.categoryIdForRequest(),
      tagIds: this.tagIdsForRequest(),
    });
  }

  private loadTagsForCategory(categoryId?: string | undefined) {
    this.tagService.getAll(categoryId).subscribe((tags) => {
      this.tags.set(tags);
      this.selectedTags.set(new Set());
    });
  }

  private categoryIdForRequest(): string | undefined {
    return this.selectedCategory() === 'all' ? undefined : this.selectedCategory();
  }

  private tagIdsForRequest(): string[] | undefined {
    const tags = Array.from(this.selectedTags());
    return tags.length ? tags : undefined;
  }
}
