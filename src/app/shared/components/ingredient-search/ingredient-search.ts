import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Output, ViewChild, effect, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IngredientSearchStateService } from '@shared/services/ingredient-search-state.service';
import { XCircle } from '../x-circle/x-circle';

@Component({
  selector: 'ingredient-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, XCircle],
  templateUrl: './ingredient-search.html',
  styleUrls: ['./ingredient-search.css'],
})
export class IngredientSearch {
  private static nextInputId = 0;
  private readonly state = inject(IngredientSearchStateService);

  @Output() submitted = new EventEmitter<void>();

  searchControl = new FormControl<string>('');
  inputId = `ingredient-input-${IngredientSearch.nextInputId++}`;

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  constructor() {
    effect(() => {
      const raw = this.state.searchTextRaw();
      const current = this.searchControl.value ?? '';
      if (raw !== current) {
        this.searchControl.setValue(raw, { emitEvent: false });
      }
    });
  }

  hasValue() {
    return !!(this.searchControl.value ?? '').length;
  }

  onSubmit(event: Event) {
    event.preventDefault();
    void this.commitSearch();
  }

  clearInput() {
    this.searchControl.setValue('', { emitEvent: false });
  }

  async commitSearch() {
    const raw = (this.searchControl.value ?? '').trim();
    const terms = this.buildSearchTerms(raw);
    const existingFilters = this.state.getActiveIngredientFilters();

    if (!terms.length && !existingFilters.length) {
      this.closeSearchInput();
      this.state.clear();
      this.submitted.emit();
      return;
    }

    this.closeSearchInput();
    this.submitted.emit();

    if (!terms.length) {
      await this.state.search([], '', { includeIngredientFilters: existingFilters });
      return;
    }

    const aggregatedFilters = Array.from(new Set([...existingFilters, ...terms]));
    await this.state.search(terms, '', { includeIngredientFilters: aggregatedFilters });
  }

  private closeSearchInput() {
    this.searchInput?.nativeElement.blur();
    this.clearInput();
  }

  private buildSearchTerms(text: string): string[] {
    const candidates = text
      .split(',')
      .map((segment) => segment.trim().replace(/\s+/g, ' '))
      .filter((segment) => segment.length >= 3);
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const candidate of candidates) {
      const normalized = candidate.toLowerCase();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        unique.push(candidate);
      }
    }
    return unique;
  }
}
