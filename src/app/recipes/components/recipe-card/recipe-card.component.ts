import { Component, computed, input } from '@angular/core';
import { Recipe } from '../../interfaces/recipe.interface';

@Component({
  selector: 'recipe-card',
  templateUrl: './recipe-card.component.html',
  styleUrls: ['./recipe-card.component.css']
})
export class RecipeCardComponent {
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
}
