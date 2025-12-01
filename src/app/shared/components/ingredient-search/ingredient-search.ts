import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, ElementRef, EventEmitter, HostListener, Output, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom, debounceTime, finalize, map, of, switchMap, tap } from 'rxjs';
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
  suggestionsLoading = signal<boolean>(false);

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

  addIngredient(
    value: string,
    options?: {
      skipFetch?: boolean;
      suppressReset?: boolean;
      suppressClose?: boolean;
      suppressEmit?: boolean;
    }
  ) {
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
    if (!options?.suppressReset) {
      this.resetInput();
    }
    if (!options?.suppressClose) {
      this.closeSuggestions();
    }
    if (!options?.suppressEmit) {
      this.submitted.emit();
    }
    if (!options?.skipFetch) {
      this.fetchRecipes();
    }
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
    void this.addIngredientsFromCommaSeparated(term);
  }

  private async addIngredientsFromCommaSeparated(text: string) {
    const normalizedText = text.trim();
    if (!normalizedText) return;

    this.state.setSearchTextRaw(normalizedText);

    const segments = normalizedText
      .split(',')
      .map((segment) => segment.trim())
      .filter((segment) => segment.length > 0);
    if (!segments.length) {
      return;
    }

    this.state.setSearchTextSegments(segments);

    const matches = new Set<string>();
    for (const segment of segments) {
      try {
        const results = await firstValueFrom(this.recipeService.searchIngredients(segment, { limit: 5 }));
        results.forEach((name) => {
          if (name) {
            matches.add(name);
          }
        });
      } catch {
        // ignore failing chunks
      }
    }

    const hasMatches = matches.size > 0;
    const currentIngredients = [...this.selectedIngredients()];
    const normalizedSet = new Set(currentIngredients.map((value) => value.trim().toLowerCase()));
    if (hasMatches) {
      const additions: string[] = [];
      Array.from(matches).forEach((match) => {
        const normalized = match.trim().toLowerCase();
        if (!normalizedSet.has(normalized)) {
          normalizedSet.add(normalized);
          additions.push(match);
        }
      });
      if (additions.length) {
        this.selectedIngredients.set([...currentIngredients, ...additions]);
      }
    }

    const searchSegments = hasMatches ? undefined : segments;

    this.resetInput();
    this.closeSuggestions();
    this.submitted.emit();
    if (hasMatches) {
      this.fetchRecipes();
    } else if (searchSegments?.length) {
      this.fetchRecipes(searchSegments, { updateState: false });
    }
  }

  resetInput() {
    this.searchControl.setValue('', { emitEvent: false });
  }

  private buildSuggestions(term: string) {
    const value = term.trim();
    if (!value) {
      this.suggestionsLoading.set(false);
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
    if (local.length) {
      this.suggestionsLoading.set(false);
      return of(local);
    }

    this.suggestionsLoading.set(true);
    const probeIngredients = [...this.selectedIngredients(), value];
    return this.recipeService
      .searchByIngredients(probeIngredients, { limit: 5, offset: 0 })
      .pipe(
        finalize(() => this.suggestionsLoading.set(false)),
        tap((res) => this.updateSuggestionPool(res)),
        map(() => {
          const pool = this.suggestionPool();
          return pool.filter((item) => item.toLowerCase().includes(value.toLowerCase())).slice(0, 8);
        })
      );
  }

  private fetchRecipes(ingredients?: string[], options?: { updateState?: boolean }) {
    const ingredientsToUse = ingredients ?? this.selectedIngredients();
    if (!ingredientsToUse.length) {
      this.results.set(null);
      this.resultsChange.emit({ count: 0, pages: 0, recipes: [] });
      this.ingredientsChange.emit([]);
      if (options?.updateState ?? true) {
        this.state.setIngredients([]);
      }
      this.state.setResults(null);
      this.state.setQueryIngredients([]);
      this.state.setSearchTextSegments([]);
      this.state.setSearchTextRaw('');
      return;
    }

    this.ingredientsChange.emit(ingredientsToUse);
    if (options?.updateState ?? true) {
      this.state.setIngredients(ingredientsToUse);
    }
    this.state.setQueryIngredients(ingredientsToUse);
    this.loading.set(true);
    this.recipeService
      .searchByIngredients(ingredientsToUse, { limit: 10, offset: 0 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.results.set(res);
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
