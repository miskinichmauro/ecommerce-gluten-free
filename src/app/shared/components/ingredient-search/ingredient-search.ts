import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, ElementRef, EventEmitter, HostListener, Output, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, map, of, switchMap, tap } from 'rxjs';
import { RecipeService, RecipeSearchResponse } from 'src/app/recipes/services/recipe.service';
import { Recipe } from 'src/app/recipes/interfaces/recipe.interface';
import { XCircle } from '../x-circle/x-circle';
import { IngredientSearchStateService } from '@shared/services/ingredient-search-state.service';

@Component({
  selector: 'ingredient-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, XCircle],
  templateUrl: './ingredient-search.html',
  styleUrls: ['./ingredient-search.css'],
})
export class IngredientSearch {
  private readonly recipeService = inject(RecipeService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly state = inject(IngredientSearchStateService);

  searchControl = new FormControl<string>('');
  private static nextInputId = 0;
  inputId = `ingredient-input-${IngredientSearch.nextInputId++}`;

  suggestions = signal<string[]>([]);
  suggestionPool = signal<string[]>([]);
  selectedIngredients = signal<string[]>([]);
  activeIndex = signal<number>(-1);
  loading = signal<boolean>(false);

  results = signal<RecipeSearchResponse | null>(null);

  @Output() resultsChange = new EventEmitter<RecipeSearchResponse>();
  @Output() ingredientsChange = new EventEmitter<string[]>();
  @Output() submitted = new EventEmitter<void>();

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('suggestContainer') suggestContainer!: ElementRef;

  dropdownOpen = computed(() => this.suggestions().length > 0);

  constructor() {
    effect(() => {
      const ings = this.state.ingredients();
      this.selectedIngredients.set(ings ?? []);
    });

    this.recipeService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((recipes) => this.updateSuggestionPool(recipes as Recipe[]));

    this.searchControl.valueChanges
      .pipe(
        debounceTime(80),
        takeUntilDestroyed(this.destroyRef),
        switchMap((text) => this.buildSuggestions(text ?? ''))
      )
      .subscribe((items) => {
        this.suggestions.set(items);
        this.activeIndex.set(items.length ? 0 : -1);
        this.cdr.markForCheck();
      });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.suggestContainer) return;
    if (!this.suggestContainer.nativeElement.contains(event.target)) {
      this.closeSuggestions();
    }
  }

  onFocusInput() {
    const term = (this.searchControl.value ?? '').trim();
    this.buildSuggestions(term)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((items) => {
        const base = this.suggestionPool().slice(0, 8);
        const next = items.length ? items : base;
        this.suggestions.set(next);
        this.activeIndex.set(next.length ? 0 : -1);
        this.cdr.markForCheck();
      });
  }

  onKeyDown(event: KeyboardEvent) {
    if (!this.suggestions().length) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex.update((idx) => (idx + 1) % this.suggestions().length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.update((idx) => (idx - 1 + this.suggestions().length) % this.suggestions().length);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.activeIndex() >= 0) {
          this.addIngredient(this.suggestions()[this.activeIndex()]);
        } else {
          this.commitFreeText();
        }
        break;
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.commitFreeText();
  }

  addIngredient(value: string) {
    const term = (value ?? '').trim();
    if (!term) return;
    const current = this.selectedIngredients();
    if (current.some((item) => item.toLowerCase() === term.toLowerCase())) {
      this.resetInput();
      this.closeSuggestions();
      return;
    }
    this.selectedIngredients.set([...current, term]);
    this.state.setIngredients(this.selectedIngredients());
    this.resetInput();
    this.closeSuggestions();
    this.submitted.emit();
    this.fetchRecipes();
  }

  removeIngredient(value: string) {
    this.selectedIngredients.set(this.selectedIngredients().filter((item) => item !== value));
    this.state.setIngredients(this.selectedIngredients());
    this.fetchRecipes();
  }

  selectSuggestion(value: string) {
    this.addIngredient(value);
  }

  closeSuggestions() {
    this.suggestions.set([]);
    this.activeIndex.set(-1);
    this.cdr.markForCheck();
  }

  hasValue() {
    return !!(this.searchControl.value ?? '').length;
  }

  onEscapePressed() {
    this.closeSuggestions();
    this.searchInput?.nativeElement?.blur();
  }

  private commitFreeText() {
    const term = (this.searchControl.value ?? '').trim();
    if (!term) return;
    this.addIngredient(term);
  }

  resetInput() {
    this.searchControl.setValue('', { emitEvent: false });
  }

  private buildSuggestions(term: string) {
    const value = term.trim();
    if (!value) {
      if (!this.suggestionPool().length) {
        return this.recipeService.getAll().pipe(
          tap((recipes) => this.updateSuggestionPool(recipes as Recipe[])),
          map(() => this.suggestionPool().slice(0, 8))
        );
      }
      return of(this.suggestionPool().slice(0, 8));
    }

    const local = this.suggestionPool()
      .filter((item) => item.toLowerCase().includes(value.toLowerCase()))
      .slice(0, 8);
    if (local.length) return of(local);

    const probeIngredients = [...this.selectedIngredients(), value];
    return this.recipeService
      .searchByIngredients(probeIngredients, { limit: 5, offset: 0 })
      .pipe(
        tap((res) => this.updateSuggestionPool(res)),
        map(() => {
          const pool = this.suggestionPool();
          return pool.filter((item) => item.toLowerCase().includes(value.toLowerCase())).slice(0, 8);
        })
      );
  }

  private fetchRecipes() {
    const ingredients = this.selectedIngredients();
    if (!ingredients.length) {
      this.results.set(null);
      this.resultsChange.emit({ count: 0, pages: 0, recipes: [] });
      this.ingredientsChange.emit([]);
      this.state.setIngredients([]);
      this.state.setResults(null);
      return;
    }

    this.ingredientsChange.emit(ingredients);
    this.loading.set(true);
    this.recipeService
      .searchByIngredients(ingredients, { limit: 10, offset: 0 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.results.set(res);
          this.state.setIngredients(ingredients);
          this.state.setResults(res);
          this.updateSuggestionPool(res);
          this.resultsChange.emit(res);
        },
        error: () => {
          this.results.set(null);
          this.state.setResults(null);
        },
        complete: () => {
          this.loading.set(false);
          this.cdr.markForCheck();
        },
      });
  }

  private updateSuggestionPool(res: RecipeSearchResponse | Recipe[]) {
    const set = new Set<string>(this.suggestionPool());
    const recipes = Array.isArray(res) ? res : res.recipes ?? [];
    recipes.forEach((recipe) => {
      let added = false;
      recipe.recipeIngredients?.forEach((ri) => {
        const name = ri?.ingredient?.name?.trim();
        if (name) {
          set.add(name);
          added = true;
        }
      });
      if (!added && recipe.title) {
        set.add(recipe.title.trim());
      }
    });
    this.suggestionPool.set(Array.from(set));
  }
}
