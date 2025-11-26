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
  }>();

  ingredients = computed<string[]>(() =>
    (this.recipe().recipeIngredients ?? [])
      .map((ri) => ri?.ingredient?.name)
      .filter((n): n is string => !!n)
  );

  private selectedIngredientSet = computed<Set<string>>(() => {
    const items = this.ingredientState.ingredients() ?? [];
    return new Set(items.map((v) => v.trim().toLowerCase()).filter(Boolean));
  });

  isIngredientSearched(name: string) {
    return this.selectedIngredientSet().has(name.trim().toLowerCase());
  }
}
