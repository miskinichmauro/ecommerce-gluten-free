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
  error = signal<string | null>(null);
  total = signal<number>(0);
  readyToShowEmpty = signal<boolean>(false);

  readonly searchTerms = computed(() => this.ingredientState.searchTerms());
  readonly matchedIngredients = computed<string[]>(() => {
    const results = this.ingredientState.results();
    const set = new Set<string>();
    results?.recipes?.forEach((recipe) => {
      (recipe.matchedIngredientNames ?? []).forEach((name) => {
        const trimmed = name?.trim();
        if (trimmed) {
          set.add(trimmed);
        }
      });
    });
    return Array.from(set);
  });

  constructor() {
    effect(() => {
      const stateResults = this.ingredientState.results();
      const stateError = this.ingredientState.error();
      const terms = this.searchTerms();

      if (stateResults) {
        this.recipes.set(stateResults.recipes ?? []);
        this.total.set(stateResults.count ?? stateResults.recipes?.length ?? 0);
        this.error.set(stateError);
        this.cdr.markForCheck();
        return;
      }

      if (terms.length && stateError) {
        this.recipes.set([]);
        this.total.set(0);
        this.error.set(stateError);
        this.cdr.markForCheck();
        return;
      }

      if (!this.readyToShowEmpty()) {
        return;
      }

      if (!terms.length) {
        this.recipes.set(this.allRecipes());
        this.total.set(this.allRecipes().length);
        this.error.set(null);
        this.cdr.markForCheck();
      }
    });

    effect(() => {
      if (this.ingredientState.searching()) {
        this.loading.set(true);
        return;
      }

      if (!this.readyToShowEmpty()) {
        return;
      }

      this.loading.set(false);
    });

  }

  ngOnInit() {
    void this.loadAllRecipes();
  }

  private async loadAllRecipes() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(this.recipeService.getAll());
      this.allRecipes.set(data ?? []);
      if (!this.ingredientState.results()) {
        this.recipes.set(data ?? []);
        this.total.set(data?.length ?? 0);
        this.cdr.markForCheck();
      }
    } catch {
      this.error.set('Error al cargar las recetas');
      this.recipes.set([]);
    } finally {
      this.loading.set(false);
      this.readyToShowEmpty.set(true);
      this.cdr.markForCheck();
    }
  }

  async removeSearchTerm(term: string) {
    const normalized = this.normalize(term);
    const remaining = this.searchTerms().filter((item) => this.normalize(item) !== normalized);
    if (!remaining.length) {
      this.resetFilters();
      return;
    }
    await this.ingredientState.search(remaining, remaining.join(', '));
    this.cdr.markForCheck();
  }

  async removeMatchedIngredient(name: string) {
    const normalized = this.normalize(name);
    const match = this.searchTerms().find((term) => {
      const candidate = this.normalize(term);
      return (
        candidate === normalized ||
        candidate.includes(normalized) ||
        normalized.includes(candidate)
      );
    });

    if (match) {
      await this.removeSearchTerm(match);
      return;
    }

    await this.ingredientState.search(this.searchTerms(), this.searchTerms().join(', '));
    this.cdr.markForCheck();
  }

  resetFilters() {
    this.ingredientState.clear();
    this.recipes.set(this.allRecipes());
    this.total.set(this.allRecipes().length);
    this.error.set(null);
    this.loading.set(false);
    this.cdr.markForCheck();
  }

  private normalize(value: string) {
    return value.trim().toLowerCase();
  }
}
