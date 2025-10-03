import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Recipe } from '../interfaces/recipe.interface';

const baseUrlRecipe = `${environment.baseUrl}/recipes`;

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private readonly http = inject(HttpClient);
  private readonly recipesCache = new Map<string, Recipe>();

  getRecipes(): Observable<Recipe[]> {
    if (this.recipesCache.size) {
      return of(Array.from(this.recipesCache.values()));
    }

    return this.http.get<Recipe[]>(baseUrlRecipe).pipe(
      tap((resp) => resp.forEach((recipe) => this.recipesCache.set(recipe.id, recipe)))
    );
  }

  getRecipeById(id: string): Observable<Recipe> {
    if (this.recipesCache.has(id)) {
      return of(this.recipesCache.get(id)!);
    }

    return this.http.get<Recipe>(`${baseUrlRecipe}/${id}`).pipe(
      tap((resp) => this.recipesCache.set(id, resp))
    );
  }

  updateRecipe(id: string, partialRecipe: Partial<Recipe>): Observable<Recipe> {
    return this.http.patch<Recipe>(`${baseUrlRecipe}/${id}`, partialRecipe).pipe(
      tap((resp) => this.recipesCache.set(id, resp))
    );
  }
}
