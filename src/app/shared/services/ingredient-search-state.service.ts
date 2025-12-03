import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { RecipeService, RecipeSearchResponse } from 'src/app/recipes/services/recipe.service';

export interface IngredientSearchOptions {
  limit?: number;
  offset?: number;
  asIngredientFilter?: boolean;
}

@Injectable({ providedIn: 'root' })
export class IngredientSearchStateService {
  private readonly recipeService = inject(RecipeService);

  searchTerms = signal<string[]>([]);
  searchTextRaw = signal<string>('');
  ingredientFilters = signal<string[]>([]);
  results = signal<RecipeSearchResponse | null>(null);
  searching = signal<boolean>(false);
  error = signal<string | null>(null);

  async search(terms: string[], rawText?: string, options?: IngredientSearchOptions) {
    const cleaned = this.cleanTerms(terms);
    if (!cleaned.length) {
      this.clear();
      return null;
    }

    const { limit, offset, asIngredientFilter } = options ?? {};
    const finalRawText = rawText ?? cleaned.join(', ');
    this.searching.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(this.recipeService.searchRecipes(cleaned, { limit, offset }));
      this.results.set(response);
      if (asIngredientFilter) {
        this.applyIngredientFilters(cleaned);
      } else {
        this.applySearchText(cleaned, finalRawText);
      }
      return response;
    } catch {
      this.results.set(null);
      if (asIngredientFilter) {
        this.applyIngredientFilters(cleaned);
      } else {
        this.applySearchText(cleaned, finalRawText);
      }
      this.error.set('No se pudieron cargar las recetas');
      return null;
    } finally {
      this.searching.set(false);
    }
  }

  clear() {
    this.searchTerms.set([]);
    this.searchTextRaw.set('');
    this.ingredientFilters.set([]);
    this.results.set(null);
    this.error.set(null);
  }

  previewTerms(terms: string[], options?: IngredientSearchOptions) {
    const asIngredientFilter = options?.asIngredientFilter ?? false;
    if (asIngredientFilter) {
      this.applyIngredientFilters(terms);
      return;
    }

    const rawText = terms.join(', ');
    this.applySearchText(terms, rawText);
  }

  private applySearchText(cleaned: string[], rawText: string) {
    this.searchTerms.set(cleaned);
    this.searchTextRaw.set(rawText);
    this.ingredientFilters.set([]);
  }

  private applyIngredientFilters(filters: string[]) {
    this.ingredientFilters.set(filters);
    this.searchTerms.set([]);
    this.searchTextRaw.set('');
  }

  private cleanTerms(terms: string[]) {
    const seen = new Set<string>();
    return terms
      .map((term) => term.trim().replace(/\s+/g, ' '))
      .filter((term) => term.length >= 3)
      .filter((term) => {
        const normalized = term.toLowerCase();
        if (seen.has(normalized)) {
          return false;
        }
        seen.add(normalized);
        return true;
      });
  }
}
