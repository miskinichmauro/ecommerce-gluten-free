import { Component, input } from '@angular/core';
import { RouterLink } from "@angular/router";
import { SlicePipe } from '@angular/common';
import { Recipe } from '../../interfaces/recipe.interface';

@Component({
  selector: 'recipes-table',
  imports: [RouterLink, SlicePipe],
  templateUrl: './recipes-table.component.html',
  styleUrls: ['./recipes-table.component.css'],
})
export class RecipesTableComponent {
  recipes = input.required<Recipe[]>();
}
