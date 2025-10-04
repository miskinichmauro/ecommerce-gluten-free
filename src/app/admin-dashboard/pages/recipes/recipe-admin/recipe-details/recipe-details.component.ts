import { Component, inject, input, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Recipe } from 'src/app/recipes/interfaces/recipe.interface';
import { FormUtils } from 'src/app/utils/form-utils';
import { FormErrorLabelComponent } from "src/app/shared/components/form-error-label/form-error-label.component";
import { RecipeService } from 'src/app/recipes/services/recipe.service';
import { Router } from '@angular/router';

@Component({
  selector: 'recipe-details',
  imports: [ReactiveFormsModule, FormErrorLabelComponent],
  templateUrl: './recipe-details.component.html',
  styleUrls: ['./recipe-details.component.css'],
})
export class RecipeDetailsComponent implements OnInit {
  router = inject(Router);
  recipeService = inject(RecipeService);
  recipe = input.required<Recipe>();

  fb = inject(FormBuilder);
  recipeForm = this.fb.group({
    title: ['', Validators.required],
    text: ['', Validators.required]
  });

  ngOnInit(): void {
    this.recipeForm.reset(this.recipe());
  }

  onSubmit() {
    this.recipeForm.markAllAsTouched();
    const formValue = this.recipeForm.value;

    const recipeData: Partial<Recipe> = {
      ...(formValue as any)
    };

    if (this.recipe().id === 'new') {
      this.recipeService.createRecipe(recipeData).subscribe(recipe => {
        this.router.navigate(['/admin/recipe', recipe.id])
      });
    } else {
      this.recipeService.updateRecipe(this.recipe().id, recipeData).subscribe();
    }
  }
}
