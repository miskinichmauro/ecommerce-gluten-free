import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { RecipeService, RecipeSearchResponse } from 'src/app/recipes/services/recipe.service';

@Injectable({ providedIn: 'root' })
export class IngredientSearchStateService {
  private readonly recipeService = inject(RecipeService);

  searchTerms = signal<string[]>([]);
  searchTextRaw = signal<string>('');
  results = signal<RecipeSearchResponse | null>(null);
  searching = signal<boolean>(false);
  error = signal<string | null>(null);

  async search(terms: string[], rawText?: string, options?: { limit?: number; offset?: number }) {
    const cleaned = this.cleanTerms(terms);
    if (!cleaned.length) {
      this.clear();
      return null;
    }

    const finalRawText = rawText ?? cleaned.join(', ');
    this.searching.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(this.recipeService.searchRecipes(cleaned, options));
      this.results.set(response);
      this.searchTerms.set(cleaned);
      this.searchTextRaw.set(finalRawText);
      return response;
    } catch {
      this.results.set(null);
      this.searchTerms.set(cleaned);
      this.searchTextRaw.set(finalRawText);
      this.error.set('No se pudieron cargar las recetas');
      return null;
    } finally {
      this.searching.set(false);
    }
  }

  clear() {
    this.searchTerms.set([]);
    this.searchTextRaw.set('');
    this.results.set(null);
    this.error.set(null);
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
