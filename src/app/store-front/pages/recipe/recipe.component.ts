import { Component, inject, signal, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { LoadingComponent } from 'src/app/shared/components/loading/loading.component';
import { RecipeService } from 'src/app/recipes/services/recipe.service';
import { Recipe } from 'src/app/recipes/interfaces/recipe.interface';
import { RecipeCardComponent } from 'src/app/recipes/components/recipe-card/recipe-card.component';

@Component({
  selector: 'app-recipe',
  imports: [LoadingComponent, RecipeCardComponent],
  templateUrl: './recipe.component.html',
  styleUrls: ['./recipe.component.css'],
})
export class RecipeComponent implements OnInit {
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
      console.error(err);
      this.error.set('Error al cargar las recetas');
    } finally {
      this.loading.set(false);
    }
  }

  ngOnInit(): void {
    this.getRecipes();
  }
}
