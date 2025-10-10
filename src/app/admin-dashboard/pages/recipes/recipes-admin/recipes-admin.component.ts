import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { RecipeService } from 'src/app/recipes/services/recipe.service';
import { Recipe } from 'src/app/recipes/interfaces/recipe.interface';
import { RouterLink } from '@angular/router';
import { RecipesTableComponent } from "src/app/recipes/components/recipes-table/recipes-table.component";
import { LoadingComponent } from "src/app/shared/components/loading/loading.component";

@Component({
  selector: 'recipes-admin',
  imports: [RouterLink, RecipesTableComponent, LoadingComponent],
  templateUrl: './recipes-admin.component.html',
  styleUrls: ['./recipes-admin.component.css'],
})
export class RecipesAdminComponent implements OnInit {
  private recipeService = inject(RecipeService);

  recipes = signal<Recipe[] | null>(null);
  total = computed(() => this.recipes()?.length ?? 0);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.getRecipes();
  }

  async getRecipes() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const data = await firstValueFrom(this.recipeService.getAll());
      this.recipes.set(data);
    } catch (err) {
      this.error.set('Error al cargar las recetas');
    } finally {
      this.loading.set(false);
    }
  }

  async delete(id: string) {
    try {
      await firstValueFrom(this.recipeService.delete(id));
      this.recipes.set(this.recipes()?.filter(r => r.id !== id)!);
    } catch (err) {
      console.error('Error al eliminar', err);
      this.error.set('No se pudo eliminar la receta.');
    }
  }
}
