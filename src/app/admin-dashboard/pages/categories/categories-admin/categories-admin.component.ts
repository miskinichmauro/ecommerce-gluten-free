import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CategoriesTableComponent } from 'src/app/categories/components/categories-table/categories-table.component';
import { Category } from 'src/app/categories/interfaces/category.interface';
import { CategoryService } from 'src/app/categories/services/category.service';
import { LoadingComponent } from '@shared/components/loading/loading.component';

@Component({
  selector: 'categories-admin',
  imports: [RouterLink, LoadingComponent, CategoriesTableComponent],
  templateUrl: './categories-admin.component.html',
  styleUrl: './categories-admin.component.css',
})
export class CategoriesAdminComponent implements OnInit {
  private categoryService = inject(CategoryService);

  categories = signal<Category[] | null>(null);
  total = computed(() => this.categories()?.length ?? 0);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.getCategories();
  }

  async getCategories() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const data = await firstValueFrom(this.categoryService.getAll());
      this.categories.set(data);
    } catch (err) {
      this.error.set('Error al cargar las categorías');
    } finally {
      this.loading.set(false);
    }
  }

  async delete(id: string) {
    try {
      await firstValueFrom(this.categoryService.delete(id));
      this.categories.set(this.categories()?.filter(category => category.id !== id) ?? null);
    } catch (err) {
      console.error('Error al eliminar categoría', err);
      this.error.set('No se pudo eliminar la categoría.');
    }
  }
}

