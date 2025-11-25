import { Injectable, signal } from '@angular/core';
import { RecipeSearchResponse } from 'src/app/recipes/services/recipe.service';

@Injectable({ providedIn: 'root' })
export class IngredientSearchStateService {
  ingredients = signal<string[]>([]);
  results = signal<RecipeSearchResponse | null>(null);

  setIngredients(list: string[]) {
    this.ingredients.set(list);
  }

  setResults(res: RecipeSearchResponse | null) {
    this.results.set(res);
  }
}
