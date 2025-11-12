import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { Product } from '@products/interfaces/product';
import { ProductService } from '@products/services/products.service';
import { debounceTime, distinctUntilChanged, switchMap, of, filter } from 'rxjs';

@Component({
  selector: 'form-search',
  imports: [],
  templateUrl: './form-search.html',
  styleUrl: './form-search.css',
})
export class FormSearch {
  private router = inject(Router);
  private productService = inject(ProductService);

  searchControl = new FormControl('');
  suggestions: Product[] = [];

  activeIndex = -1;


  constructor() {

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((text) => {
          const term = (text ?? '').trim();
          if (term.length < 2) {
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
  }

  selectSuggestion(product: Product) {
    this.closeSuggestions();
    this.router.navigate(['/product', product.slug]);
  }
}
