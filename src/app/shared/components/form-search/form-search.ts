import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Output, inject, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { Product } from '@products/interfaces/product';
import { ProductService } from '@products/services/products.service';
import { GuaraniesPipe } from '@shared/pipes/guaranies-pipe';
import { debounceTime, switchMap, of, filter, tap, map, take } from 'rxjs';
import { XCircle } from "../x-circle/x-circle";

@Component({
  selector: 'form-search',
  imports: [GuaraniesPipe, ReactiveFormsModule, XCircle],
  templateUrl: './form-search.html',
  styleUrl: './form-search.css',
})
export class FormSearch {
  private router = inject(Router);
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);

  searchControl = new FormControl('');
  suggestions: Product[] = [];
  private static nextInputId = 0;
  inputId = `searchControl-${FormSearch.nextInputId++}`;
  private suggestionCache = new Map<string, Product[]>();

  activeIndex = -1;

  @Output() searched = new EventEmitter<void>();
  @Output() dismissed = new EventEmitter<void>();

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('suggestContainer') suggestContainer!: ElementRef;

  constructor() {

    this.searchControl.valueChanges
      .pipe(
        debounceTime(80),
        switchMap((text) => {
          const term = (text ?? '').trim();
          if (term.length < 1) {
            this.closeSuggestions();
            return of<Product[]>([]);
          }
          return this.fetchSuggestions(term);
        })
      )
      .subscribe((products: Product[]) => {
        this.suggestions = products;
        this.activeIndex = -1;
        this.cdr.markForCheck();
      });

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const isHome = event.urlAfterRedirects === '/' || event.url === '/';

        if (isHome) {
          this.searchControl.setValue('', { emitEvent: false });
          this.closeSuggestions();
        }
      });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.suggestContainer) return;
    if (!this.suggestContainer.nativeElement.contains(event.target)) {
      this.closeSuggestions();
    }
  }

  closeSuggestions() {
    this.suggestions = [];
    this.activeIndex = -1;
    this.cdr.markForCheck();
  }

  onEscapePressed() {
    this.closeSuggestions();
    this.dismissed.emit();
    this.searchInput?.nativeElement?.blur();
  }

  clearSearchOrClose() {
    if ((this.searchControl.value ?? '').length === 0) {
      this.closeSuggestions();
      this.searchControl.setValue('', { emitEvent: false });
      this.dismissed.emit();
      return;
    }

    this.searchControl.setValue('', { emitEvent: false });
    this.closeSuggestions();
    this.searchInput?.nativeElement?.focus();
  }

  onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowDown':
        if (!this.suggestions.length) return;
        event.preventDefault();
        this.activeIndex = (this.activeIndex + 1) % this.suggestions.length;
        break;

      case 'ArrowUp':
        if (!this.suggestions.length) return;
        event.preventDefault();
        this.activeIndex = (this.activeIndex - 1 + this.suggestions.length) % this.suggestions.length;
        break;

      case 'Enter':
        event.preventDefault();
        if (this.activeIndex >= 0) {
          this.selectSuggestion(this.suggestions[this.activeIndex]);
        } else {
          this.performSearch(this.searchControl.value ?? '');
        }
        break;
    }
  }

  onSubmit(e: Event) {
    e.preventDefault();
    this.performSearch(this.searchControl.value ?? '');
  }

  performSearch(q: string) {
    this.closeSuggestions();
    this.router.navigate(['/products'], { queryParams: { q } });
    this.searchControl.setValue('', { emitEvent: false });
    this.blurInput();
    this.searched.emit();
  }

  selectSuggestion(product: Product) {
    this.closeSuggestions();
    this.router.navigate(['/product', product.slug]);
    this.searchControl.setValue('', { emitEvent: false });
    this.searched.emit();
  }

  focusInput() {
    setTimeout(() => this.searchInput?.nativeElement?.focus(), 0);
  }

  hasSearchValue() {
    return !!(this.searchControl.value ?? '').length;
  }

  onFocusInput() {
    const term = (this.searchControl.value ?? '').trim();
    if (!term.length) return;

    this.fetchSuggestions(term)
      .pipe(take(1))
      .subscribe((products) => {
        this.suggestions = products;
        this.activeIndex = -1;
        this.cdr.markForCheck();
      });
  }

  private blurInput() {
    this.searchInput?.nativeElement?.blur();
  }

  private fetchSuggestions(term: string) {
    const key = term.toLowerCase();
    const cached = this.suggestionCache.get(key);
    if (cached) return of(cached);

    return this.productService.searchProducts({ query: term, limit: 5 }).pipe(
      map((res: any) => res?.products ?? []),
      tap((products) => this.suggestionCache.set(key, products))
    );
  }
}
