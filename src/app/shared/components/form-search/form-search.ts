import { Component, ElementRef, EventEmitter, HostListener, Output, inject, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { Product } from '@products/interfaces/product';
import { ProductService } from '@products/services/products.service';
import { GuaraniesPipe } from '@shared/pipes/guaranies-pipe';
import { debounceTime, distinctUntilChanged, switchMap, of, filter } from 'rxjs';
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

  searchControl = new FormControl('');
  suggestions: Product[] = [];
  private static nextInputId = 0;
  inputId = `searchControl-${FormSearch.nextInputId++}`;

  activeIndex = -1;

  @Output() searched = new EventEmitter<void>();
  @Output() dismissed = new EventEmitter<void>();

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  constructor() {

    this.searchControl.valueChanges
      .pipe(
        debounceTime(150),
        distinctUntilChanged(),
        switchMap((text) => {
          const term = (text ?? '').trim();
          if (term.length < 1) {
            this.closeSuggestions();
            return of({ products: [] });
          }
          return this.productService.searchProducts({ query: term, limit: 5 });
        })
      )
      .subscribe((res: any) => {
        this.suggestions = res?.products ?? [];
        this.activeIndex = -1;
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

  @ViewChild('suggestContainer') suggestContainer!: ElementRef;
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
  }

  onEscapePressed() {
    this.closeSuggestions();
    this.dismissed.emit();
    this.searchInput?.nativeElement?.blur();
  }

  clearSearch() {
    if ((this.searchControl.value ?? '').length === 0) return;
    this.searchControl.setValue('', { emitEvent: false });
    this.closeSuggestions();
    this.searchInput?.nativeElement?.focus();
  }

  onKeyDown(event: KeyboardEvent) {
    if (!this.suggestions.length) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex = (this.activeIndex + 1) % this.suggestions.length;
        break;

      case 'ArrowUp':
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
    // Clear input without triggering another search
    this.searchControl.setValue('', { emitEvent: false });
    // Notify parent (navbar) to close mobile search if open
    this.searched.emit();
  }

  selectSuggestion(product: Product) {
    this.closeSuggestions();
    this.router.navigate(['/product', product.slug]);
    // Also clear and notify to close mobile overlay
    this.searchControl.setValue('', { emitEvent: false });
    this.searched.emit();
  }

  focusInput() {
    setTimeout(() => this.searchInput?.nativeElement?.focus(), 0);
  }
}
