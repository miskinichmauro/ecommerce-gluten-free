import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { RecipeService } from 'src/app/recipes/services/recipe.service';
import { Recipe } from 'src/app/recipes/interfaces/recipe.interface';
import { RouterLink } from '@angular/router';
import { RecipesTableComponent } from "src/app/recipes/components/recipes-table/recipes-table.component";

@Component({
  selector: 'recipes-admin',
  imports: [RouterLink, RecipesTableComponent],
  templateUrl: './recipes-admin.component.html',
  styleUrls: ['./recipes-admin.component.css'],
})
export class RecipesAdminComponent implements OnInit {
  private recipeService = inject(RecipeService);

  recipes = signal<Recipe[] | null>(null);
  totalRecipes = computed(() => this.recipes()?.length ?? 0);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.getRecipes();
  }

  async getRecipes() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const data = await firstValueFrom(this.recipeService.getRecipes());
      this.recipes.set(data);
    } catch (err) {
      this.error.set('Error al cargar las recetas');
    } finally {
      this.loading.set(false);
    }
  }

  async delete(id: string) {
    try {
      await firstValueFrom(this.recipeService.deleteRecipe(id));
      this.recipes.set(this.recipes()?.filter(r => r.id !== id)!);
    } catch (err) {
      console.error('Error al eliminar', err);
      this.error.set('No se pudo eliminar la receta.');
    }
  }
}
