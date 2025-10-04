import { Component, inject, signal, OnInit } from '@angular/core';
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
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

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

  ngOnInit(): void {
    this.getRecipes();
  }
}
