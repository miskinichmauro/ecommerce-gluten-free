import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { finalize, map, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Recipe } from '../interfaces/recipe.interface';
import { ToastService } from '@shared/services/toast.service';

const baseUrlRecipes = `${environment.baseUrl}/recipes`;

export interface RecipeSearchResponse {
  count: number;
  pages: number;
  recipes: Array<Recipe & {
    matchCount?: number;
    matchedIngredientNames?: string[];
    recipeIngredients?: Array<{ ingredient?: { name?: string } }>;
  }>;
}

const emptyRecipe: Recipe = {
  id: 'new',
  title: '',
  text: ''
};

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private readonly http = inject(HttpClient);
  private readonly recipesCache = new Map<string, Recipe>();
  private readonly toastService = inject(ToastService);

  getAll(): Observable<Recipe[]> {
    if (this.recipesCache.size) {
      return of(Array.from(this.recipesCache.values()));
    }

    return this.http.get<Recipe[]>(baseUrlRecipes).pipe(
      tap((res) => res.forEach((recipe) => this.recipesCache.set(recipe.id, recipe)))
    );
  }

  getById(id: string): Observable<Recipe> {
    if (id === 'new') {
      return of(emptyRecipe);
    }

    if (this.recipesCache.has(id)) {
      return of(this.recipesCache.get(id)!);
    }

    return this.http.get<Recipe>(`${baseUrlRecipes}/${id}`).pipe(
      tap((res) => this.recipesCache.set(id, res))
    );
  }

  create(recipe: Partial<Recipe>): Observable<Recipe> {
    this.toastService.activateLoading();
    return this.http.post<Recipe>(baseUrlRecipes, recipe).pipe(
      tap(async(res) => {
        this.insertOrUpdateCache(res);
        this.toastService.activateSuccess();
      }),
      finalize(() => this.toastService.deactivateLoading())
    );
  }

  update(id: string, partialRecipe: Partial<Recipe>): Observable<Recipe> {
    this.toastService.activateLoading();
    return this.http.patch<Recipe>(`${baseUrlRecipes}/${id}`, partialRecipe).pipe(
      tap((res) => {
        this.insertOrUpdateCache(res);
        this.toastService.activateSuccess();
      }),
      finalize(() => this.toastService.deactivateLoading())
    );
  }

  delete(id: string): Observable<Recipe> {
    this.toastService.activateLoading();
    return this.http.delete<Recipe>(`${baseUrlRecipes}/${id}`).pipe(
      tap(async() => {
        this.recipesCache.delete(id);
        this.toastService.activateSuccess();
      }),
      finalize(() => this.toastService.deactivateLoading())
    );
  }

  insertOrUpdateCache(recipe: Recipe) {
    this.recipesCache.set(recipe.id, recipe);
  }

  searchByIngredients(ingredients: string[], options?: { limit?: number; offset?: number }): Observable<RecipeSearchResponse> {
    const cleaned = (ingredients ?? []).map((i) => i.trim()).filter((i) => !!i);
    const params = new HttpParams({
      fromObject: {
        ingredients: cleaned.join(','),
        limit: String(options?.limit ?? 10),
        offset: String(options?.offset ?? 0),
      },
    });
    return this.http.get<RecipeSearchResponse>(`${baseUrlRecipes}/search`, {
      params,
      responseType: 'json',
    });
  }

  searchIngredients(query: string, options?: { limit?: number }): Observable<string[]> {
    const trimmed = (query ?? '').trim();
    if (!trimmed) {
      return of([]);
    }

    const params = new HttpParams({
      fromObject: {
        query: trimmed,
        limit: String(options?.limit ?? 5),
      },
    });

    return this.http.get<Array<string | { name?: string }>>(`${environment.baseUrl}/ingredients/search`, {
      params,
    }).pipe(
      map((items) => {
        if (!Array.isArray(items)) return [];
        return items
          .map((item) => {
            if (typeof item === 'string') return item.trim();
            return item?.name?.trim() ?? '';
          })
          .filter((name): name is string => typeof name === 'string' && name.length > 0);
      })
    );
  }
}
