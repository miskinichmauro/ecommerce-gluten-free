import { Component, input } from '@angular/core';
import { Recipe } from '../../interfaces/recipe.interface';

@Component({
  selector: 'recipe-card',
  templateUrl: './recipe-card.component.html',
  styleUrls: ['./recipe-card.component.css']
})
export class RecipeCardComponent {
  recipe = input.required<Recipe>();
}
