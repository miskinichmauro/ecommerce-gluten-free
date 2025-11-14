import { Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map, firstValueFrom } from 'rxjs';
import { Category } from 'src/app/categories/interfaces/category.interface';
import { CategoryService } from 'src/app/categories/services/category.service';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { CategoryDetailsComponent } from './category-details/category-details.component';

@Component({
  selector: 'category-admin',
  imports: [LoadingComponent, CategoryDetailsComponent],
  templateUrl: './category-admin.component.html',
  styleUrl: './category-admin.component.css',
})
export class CategoryAdminComponent {
  private activateRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private categoryService = inject(CategoryService);

  categoryId = toSignal(
    this.activateRoute.params.pipe(map(params => params['id']))
  );

  category = signal<Category | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  constructor() {
    effect(() => {
      const id = this.categoryId();
      if (id) {
        this.loadCategory(id);
      }
    });
  }

  private async loadCategory(id: string) {
    this.loading.set(true);
    this.error.set(null);

    try {
      const category = await firstValueFrom(this.categoryService.getById(id));
      this.category.set(category);
    } catch (err) {
      this.error.set('Error al cargar la categoría');
      this.router.navigate(['/admin/categories']);
    } finally {
      this.loading.set(false);
    }
  }
}

