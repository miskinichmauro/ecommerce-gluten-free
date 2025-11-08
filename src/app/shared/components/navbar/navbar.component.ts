import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import { of } from 'rxjs';
import { ProductService } from 'src/app/products/services/products.service';
import { Product } from 'src/app/products/interfaces/product';
import { LogoComponent } from '../logo/logo.component';
import { NavUserOptionsComponent } from "../nav-options/nav-user-options.component";
import { AuthService } from '@auth/auth.service';
import { ConfigurationService } from '../../services/configuration.service';
import { GuaraniesPipe } from '@shared/pipes/guaranies-pipe';

@Component({
  selector: 'navbar',
  imports: [LogoComponent, NavUserOptionsComponent, ReactiveFormsModule, GuaraniesPipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  @ViewChild('suggestContainer') suggestContainer!: ElementRef;

  searchControl = new FormControl('');
  suggestions: Product[] = [];

  activeIndex = -1;

  private router = inject(Router);
  private productService = inject(ProductService);
  configurationService = inject(ConfigurationService);
  authService = inject(AuthService);

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
