import { Component, HostListener, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Recipe } from 'src/app/recipes/interfaces/recipe.interface';
import { FormErrorLabelComponent } from "src/app/shared/components/form-error-label/form-error-label.component";
import { RecipeService } from 'src/app/recipes/services/recipe.service';
import { Router } from '@angular/router';
import { ConfigurationService } from 'src/app/shared/services/configuration.service';

@Component({
  selector: 'recipe-details',
  imports: [ReactiveFormsModule, FormErrorLabelComponent],
  templateUrl: './recipe-details.component.html',
  styleUrls: ['./recipe-details.component.css'],
})
export class RecipeDetailsComponent implements OnInit {
  recipe = input.required<Recipe>();

  router = inject(Router);
  recipeService = inject(RecipeService);
  configurationService = inject(ConfigurationService);

  fb = inject(FormBuilder);
  recipeForm = this.fb.group({
    title: ['', Validators.required],
    text: ['', Validators.required]
  });

  ngOnInit(): void {
    this.recipeForm.reset(this.recipe());
  }

  onSubmit() {
    this.configurationService.loading.set(true);

    this.recipeForm.markAllAsTouched();
    const formValue = this.recipeForm.value;

    const recipeData: Partial<Recipe> = {
      ...(formValue as any)
    };

    let request$;
    if (this.recipe().id === 'new') {
      request$ = this.recipeService.create(recipeData);
    } else {
      request$ = this.recipeService.update(this.recipe().id, recipeData);
    }

    request$.subscribe({
      next: async () => {
        await this.configurationService.toggleToast();
        this.router.navigate(["/admin/recipes"]);
      },
      error: () => {
        this.configurationService.loading.set(false);
      }
    });
  }

  controlPresionado: boolean = false;
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Control') {
      this.controlPresionado = true;
    } else if (event.key === 'Enter' && this.controlPresionado) {
      this.onSubmit();
    }
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyboardUp(event: KeyboardEvent) {
    if (event.key === 'Control') {
      this.controlPresionado = false;
    }
  }
}
