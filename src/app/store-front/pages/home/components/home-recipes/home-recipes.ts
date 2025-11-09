import { Component, inject, signal, OnInit } from '@angular/core';
import { RecipeService } from 'src/app/recipes/services/recipe.service';
import { RecipeCardComponent } from 'src/app/recipes/components/recipe-card/recipe-card.component';
import { LoadingComponent } from 'src/app/shared/components/loading/loading.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'home-recipes',
  standalone: true,
  imports: [RouterLink, RecipeCardComponent, LoadingComponent],
  templateUrl: './home-recipes.html',
  styleUrl: './home-recipes.css',
})
export class HomeRecipes implements OnInit {

  private recipeService = inject(RecipeService);
  recipes = signal<any[]>([]);
  loading = signal(true);

  async ngOnInit() {
    try {
      const res = await this.recipeService.getAll().toPromise();
      this.recipes.set((res ?? []).slice(0, 3));
    } finally {
      this.loading.set(false);
    }
  }
}
