import { ChangeDetectorRef, Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { RecipeService } from 'src/app/recipes/services/recipe.service';
import { Recipe } from 'src/app/recipes/interfaces/recipe.interface';
import { RecipeCardComponent } from 'src/app/recipes/components/recipe-card/recipe-card.component';
import { RecipeSkeleton } from 'src/app/recipes/components/recipe-skeleton/recipe-skeleton';
import { XCircle } from 'src/app/shared/components/x-circle/x-circle';
import { IngredientSearchStateService } from '@shared/services/ingredient-search-state.service';

@Component({
  selector: 'app-recipe',
  imports: [RecipeCardComponent, RecipeSkeleton, XCircle],
  templateUrl: './recipe.component.html',
  styleUrls: ['./recipe.component.css', './recipe.chips.css'],
})
export class RecipeComponent implements OnInit {
  private recipeService = inject(RecipeService);
  private ingredientState = inject(IngredientSearchStateService);
  private cdr = inject(ChangeDetectorRef);

  recipes = signal<Recipe[] | null>(null);
  allRecipes = signal<Recipe[]>([]);
  loading = signal<boolean>(true);
  searching = signal<boolean>(false);
  error = signal<string | null>(null);
  total = signal<number>(0);
  queryIngredients = signal<string[]>([]);
  readonly searchTextRaw = computed(() => this.ingredientState.searchTextRaw());
  readyToShowEmpty = signal<boolean>(false);

  constructor() {
    effect(() => {
      const res = this.ingredientState.results();
      if (res) {
        this.recipes.set(res.recipes ?? []);
        this.total.set(res.count ?? res.recipes?.length ?? 0);
        this.loading.set(false);
        this.searching.set(false);
        return;
      }

      if (!this.readyToShowEmpty()) {
        return;
      }

      if (this.queryIngredients().length) {
        this.loading.set(false);
        this.searching.set(false);
      } else {
        this.loading.set(false);
        this.searching.set(false);
        this.recipes.set(this.allRecipes());
        this.total.set(this.allRecipes().length);
      }
    });

    effect(() => {
      const ings = this.ingredientState.ingredients();
      this.queryIngredients.set(ings ?? []);

      if (!ings || !ings.length) {
        if (this.readyToShowEmpty()) {
          this.loading.set(false);
          this.searching.set(false);
          this.recipes.set(this.allRecipes());
          this.total.set(this.allRecipes().length);
        }
        return;
      }

      this.searching.set(true);
      this.loading.set(true);
    });
  }

  ngOnInit(): void {
    this.getRecipes();
  }

  async getRecipes() {
    this.loading.set(true);
    this.error.set(null);
    this.readyToShowEmpty.set(false);
    try {
      const data = await firstValueFrom(this.recipeService.getAll());
      this.recipes.set(data);
      this.allRecipes.set(data ?? []);
      this.total.set(data?.length ?? 0);
      this.cdr.markForCheck();
    } catch (err) {
      this.error.set('Error al cargar las recetas');
      this.cdr.markForCheck();
  } finally {
      this.loading.set(false);
      this.cdr.markForCheck();
      this.readyToShowEmpty.set(true);
    }
  }

  removeIngredient(ing: string) {
    const next = this.ingredientState.ingredients().filter((i) => i !== ing);
    this.ingredientState.setIngredients(next);
    this.queryIngredients.set(next);
    if (!next.length) {
      this.recipes.set(this.allRecipes());
      this.total.set(this.allRecipes().length);
      this.searching.set(false);
      this.loading.set(false);
      this.ingredientState.setResults(null);
      this.cdr.markForCheck();
      return;
    }

    this.fetchByIngredients(next);
  }

  clearIngredients() {
    this.ingredientState.setIngredients([]);
    this.ingredientState.setResults(null);
    this.ingredientState.setSearchTextSegments([]);
    this.ingredientState.setSearchTextRaw('');
    this.queryIngredients.set([]);
    this.recipes.set(this.allRecipes());
    this.total.set(this.allRecipes().length);
    this.searching.set(false);
    this.loading.set(false);
    this.cdr.markForCheck();
  }

  clearSearchTextOnly() {
    this.ingredientState.setSearchTextSegments([]);
    this.ingredientState.setSearchTextRaw('');
  }

  private async fetchByIngredients(ingredients: string[]) {
    this.loading.set(true);
    this.error.set(null);
    this.readyToShowEmpty.set(false);
    try {
      const res = await firstValueFrom(this.recipeService.searchByIngredients(ingredients, { limit: 10, offset: 0 }));
      this.recipes.set(res.recipes ?? []);
      this.total.set(res.count ?? res.recipes?.length ?? 0);
      this.ingredientState.setResults(res);
    } catch (err) {
      this.error.set('Error al buscar recetas');
      this.recipes.set([]);
    } finally {
      this.loading.set(false);
      this.searching.set(false);
      this.cdr.markForCheck();
      this.readyToShowEmpty.set(true);
    }
  }
}
