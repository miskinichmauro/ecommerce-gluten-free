import { Injectable, signal } from '@angular/core';
import { RecipeSearchResponse } from 'src/app/recipes/services/recipe.service';

@Injectable({ providedIn: 'root' })
export class IngredientSearchStateService {
  ingredients = signal<string[]>([]);
  queryIngredients = signal<string[]>([]);
  searchTextSegments = signal<string[]>([]);
  searchTextRaw = signal<string>('');
  results = signal<RecipeSearchResponse | null>(null);

  setIngredients(list: string[]) {
    this.ingredients.set(list);
  }

  setQueryIngredients(list: string[]) {
    this.queryIngredients.set(list);
  }

  setSearchTextSegments(list: string[]) {
    this.searchTextSegments.set(list);
  }

  setSearchTextRaw(text: string) {
    this.searchTextRaw.set(text);
  }

  setResults(res: RecipeSearchResponse | null) {
    this.results.set(res);
  }
}
