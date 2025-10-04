import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Recipe } from '../interfaces/recipe.interface';

const baseUrlRecipes = `${environment.baseUrl}/recipes`;

const emptyRecipe: Recipe = {
  id: 'new',
  title: '',
  text: ''
};

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private readonly http = inject(HttpClient);
  private readonly recipesCache = new Map<string, Recipe>();

  getRecipes(): Observable<Recipe[]> {
    if (this.recipesCache.size) {
      return of(Array.from(this.recipesCache.values()));
    }

    return this.http.get<Recipe[]>(baseUrlRecipes).pipe(
      tap((resp) => resp.forEach((recipe) => this.recipesCache.set(recipe.id, recipe)))
    );
  }

  getRecipeById(id: string): Observable<Recipe> {
    if (id === 'new') {
      return of(emptyRecipe);
    }

    if (this.recipesCache.has(id)) {
      return of(this.recipesCache.get(id)!);
    }

    return this.http.get<Recipe>(`${baseUrlRecipes}/${id}`).pipe(
      tap((resp) => this.recipesCache.set(id, resp))
    );
  }

  createRecipe(recipe: Partial<Recipe>): Observable<Recipe> {
    return this.http.post<Recipe>(baseUrlRecipes, recipe).pipe(
      tap((res) => this.insertOrUpdateCache(res))
    );
  }

  updateRecipe(id: string, partialRecipe: Partial<Recipe>): Observable<Recipe> {
    return this.http.patch<Recipe>(`${baseUrlRecipes}/${id}`, partialRecipe).pipe(
      tap((resp) => this.insertOrUpdateCache(resp))
    );
  }

  insertOrUpdateCache(recipe: Recipe) {
      const existCache = this.recipesCache.get(recipe.id);

      console.log(existCache);
      if (!existCache) {
        this.recipesCache.clear();
      } else {
        this.recipesCache.set(recipe.id, recipe);
      }
    }
}
