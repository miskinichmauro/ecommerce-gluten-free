import { Component, computed, input, inject } from '@angular/core';
import { Recipe } from '../../interfaces/recipe.interface';
import { IngredientSearchStateService } from '@shared/services/ingredient-search-state.service';

@Component({
  selector: 'recipe-card',
  templateUrl: './recipe-card.component.html',
  styleUrls: ['./recipe-card.component.css']
})
export class RecipeCardComponent {
  private readonly ingredientState = inject(IngredientSearchStateService);

  recipe = input.required<Recipe & {
    description?: string | null;
    recipeIngredients?: Array<{ ingredient?: { name?: string } }>;
    matchCount?: number;
    matchedIngredientNames?: string[];
  }>();

  ingredients = computed<string[]>(() =>
    (this.recipe().recipeIngredients ?? [])
      .map((ri) => ri?.ingredient?.name)
      .filter((n): n is string => !!n)
  );

  private ingredientFilterSet = computed<Set<string>>(() => {
    const values = this.ingredientState.searchTerms() ?? [];
    return new Set(values.map((v) => v.trim().toLowerCase()).filter(Boolean));
  });

  private matchedIngredientSet = computed<Set<string>>(() => {
    const matches = this.recipe().matchedIngredientNames ?? [];
    return new Set(matches.map((match) => match.trim().toLowerCase()).filter(Boolean));
  });

  isIngredientSearched(name: string) {
    const normalized = name.trim().toLowerCase();
    return this.matchedIngredientSet().has(normalized) || this.ingredientFilterSet().has(normalized);
  }
}
