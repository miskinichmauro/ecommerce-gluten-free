import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CategoryService } from 'src/app/categories/services/category.service';
import { TagService } from 'src/app/tags/services/tag.service';
import { Category } from 'src/app/categories/interfaces/category.interface';
import { Tag } from 'src/app/tags/interfaces/tag.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigurationService } from 'src/app/shared/services/configuration.service';

@Component({
  selector: 'mobile-product-filters',
  standalone: true,
  templateUrl: './mobile-product-filters.component.html',
  styleUrl: './mobile-product-filters.component.css',
})
export class MobileProductFiltersComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private tagService = inject(TagService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private configurationService = inject(ConfigurationService);

  categories = signal<Category[]>([]);
  tags = signal<Tag[]>([]);
  selectedCategory = signal<string>('all');
  selectedTags = signal<Set<string>>(new Set());
  pendingTags = signal<Set<string>>(new Set());
  hasPendingTagChanges = computed(() => {
    const applied = this.selectedTags();
    const pending = this.pendingTags();
    if (applied.size !== pending.size) return true;
    for (const tag of pending) {
      if (!applied.has(tag)) return true;
    }
    return false;
  });

  ngOnInit() {
    this.categoryService.getAll().subscribe((cats) => this.categories.set(cats));

    this.route.queryParamMap.subscribe((params) => {
      const categoryId = params.get('categoryId') ?? 'all';
      const tagIdsParam = params.get('tagIds') ?? '';
      const tagIds = tagIdsParam ? tagIdsParam.split(',').filter(Boolean) : [];

      this.selectedCategory.set(categoryId);
      const tagSet = new Set(tagIds);
      this.selectedTags.set(tagSet);
      this.pendingTags.set(new Set(tagSet));
      this.loadTags(categoryId === 'all' ? undefined : categoryId);
    });
  }

  selectCategory(id: string) {
    this.selectedCategory.set(id);
    this.selectedTags.set(new Set());
    this.pendingTags.set(new Set());
    this.loadTags(id === 'all' ? undefined : id);
    this.updateQueryParams(true);
  }

  toggleTag(id: string) {
    const next = new Set(this.pendingTags());
    if (next.has(id)) next.delete(id); else next.add(id);
    this.pendingTags.set(next);
  }

  resetTags() {
    if (!this.selectedTags().size && !this.pendingTags().size) return;
    this.selectedTags.set(new Set());
    this.pendingTags.set(new Set());
    this.updateQueryParams();
  }

  applyTags() {
    this.selectedTags.set(new Set(this.pendingTags()));
    this.updateQueryParams(true);
  }

  private loadTags(categoryId?: string) {
    this.tagService.getAll(categoryId).subscribe((tags) => this.tags.set(tags));
  }

  private updateQueryParams(closeSidebar = false) {
    const tags = Array.from(this.selectedTags());
    this.router.navigate(['/products'], {
      queryParams: {
        categoryId: this.selectedCategory() === 'all' ? null : this.selectedCategory(),
        tagIds: tags.length ? tags.join(',') : null,
      },
      queryParamsHandling: 'merge',
    }).then(() => {
      if (closeSidebar) {
        this.configurationService.toggleSidebarItemsStatus('closed');
        this.configurationService.toggleSidebarPageStatus('closed');
      }
    });
  }
}
