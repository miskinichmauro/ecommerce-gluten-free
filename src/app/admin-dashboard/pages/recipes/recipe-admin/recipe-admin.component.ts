import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingComponent } from 'src/app/shared/components/loading/loading.component';
import { Recipe } from 'src/app/recipes/interfaces/recipe.interface';
import { RecipeService } from 'src/app/recipes/services/recipe.service';
import { RecipeDetailsComponent } from './recipe-details/recipe-details.component';
import { firstValueFrom, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'recipe-admin',
  imports: [LoadingComponent, RecipeDetailsComponent],
  templateUrl: './recipe-admin.component.html',
  styleUrls: ['./recipe-admin.component.css'],
})
export class RecipeAdminComponent {
  private activateRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private recipeService = inject(RecipeService);

  recipeId = toSignal(
    this.activateRoute.params.pipe(
      map(params => params['id'])
    )
  );

  recipe = signal<Recipe | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  constructor() {
    effect(() => {
      const id = this.recipeId();
      this.loadRecipe(id);
    });
  }

  private async loadRecipe(id: string) {
    this.loading.set(true);
    this.error.set(null);

    try {
      const recipe = await firstValueFrom(this.recipeService.getById(id));
      this.recipe.set(recipe);
    } catch (err) {
      this.error.set('Error al cargar la receta');
      this.router.navigate(['/admin/recipes']);
    } finally {
      this.loading.set(false);
    }
  }
}
