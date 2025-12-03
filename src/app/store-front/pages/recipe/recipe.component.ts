import { ChangeDetectorRef, Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { RecipeService } from 'src/app/recipes/services/recipe.service';
import { Recipe } from 'src/app/recipes/interfaces/recipe.interface';
import { RecipeCardComponent } from 'src/app/recipes/components/recipe-card/recipe-card.component';
import { RecipeSkeleton } from 'src/app/recipes/components/recipe-skeleton/recipe-skeleton';
import { XCircle } from 'src/app/shared/components/x-circle/x-circle';
import { IngredientSearchOptions, IngredientSearchStateService } from '@shared/services/ingredient-search-state.service';

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
  private hiddenMatchedFilters = signal<Set<string>>(new Set());

  readonly visibleMatchedIngredients = computed<string[]>(() => {
    const results = this.ingredientState.results();
    const filters = this.ingredientState.getActiveIngredientFilters();
    const hidden = this.hiddenMatchedFilters();
    const normalizedSeen = new Set<string>();
    const chips: string[] = [];

    const addChip = (value?: string) => {
      if (!value) {
        return;
      }
      const trimmed = value.trim();
      if (!trimmed) {
        return;
      }
      const normalized = this.normalize(trimmed);
      if (normalizedSeen.has(normalized)) {
        return;
      }
      normalizedSeen.add(normalized);
      if (!hidden.has(normalized)) {
        chips.push(trimmed);
      }
    };

    filters.forEach(addChip);
    results?.recipes?.forEach((recipe) => {
      (recipe.matchedIngredientNames ?? []).forEach(addChip);
    });

    return chips;
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
    await this.applyTerms(remaining);
  }

  async removeMatchedIngredient(name: string) {
    const normalized = this.normalize(name);
    const filters = this.ingredientState.getActiveIngredientFilters();
    const remainingFilters = filters.filter((value) => this.normalize(value) !== normalized);

    this.hiddenMatchedFilters.update((set) => {
      const next = new Set(set);
      next.add(normalized);
      return next;
    });

    if (!remainingFilters.length) {
      this.resetFilters();
      return;
    }

    await this.applyTerms(remainingFilters, { asIngredientFilter: true });
  }

  private async applyTerms(terms: string[], options?: IngredientSearchOptions) {
    if (!terms.length) {
      this.resetFilters();
      return;
    }

    this.revealFilters(terms);
    this.ingredientState.previewTerms(terms, options);
    const asIngredientFilter = options?.asIngredientFilter ?? false;
    const rawText = asIngredientFilter ? '' : terms.join(', ');
    await this.ingredientState.search(terms, rawText, options);
    this.cdr.markForCheck();
  }

  resetFilters() {
    this.ingredientState.clear();
    this.recipes.set(this.allRecipes());
    this.total.set(this.allRecipes().length);
    this.error.set(null);
    this.loading.set(false);
    this.cdr.markForCheck();
    this.hiddenMatchedFilters.set(new Set());
  }

  private normalize(value: string) {
    return value.trim().toLowerCase();
  }

  private revealFilters(terms: string[]) {
    if (!terms.length) {
      return;
    }

    this.hiddenMatchedFilters.update((set) => {
      const next = new Set(set);
      terms.forEach((term) => next.delete(this.normalize(term)));
      return next;
    });
  }
}
