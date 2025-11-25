import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { ReactiveFormsModule,  } from '@angular/forms';
import { LogoComponent } from '../logo/logo.component';
import { NavUserOptionsComponent } from "../nav-options/nav-user-options.component";
import { MENU_ITEMS } from '@store-front/components/menu-items';
import { SidebarItemsComponent } from "../sidebar-items/sidebar-items.component";
import { FormSearch } from "../form-search/form-search";
import { ConfigurationService } from '@shared/services/configuration.service';
import { IngredientSearch } from '../ingredient-search/ingredient-search';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'navbar',
  imports: [LogoComponent, NavUserOptionsComponent, ReactiveFormsModule, SidebarItemsComponent, FormSearch, IngredientSearch],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  configurationService = inject(ConfigurationService);
  private router = inject(Router);

  menuItems = MENU_ITEMS;
  isRecipePage = signal<boolean>(this.router.url?.startsWith('/recipe') ?? false);

  @ViewChild('mobileSearch') mobileSearch!: FormSearch;
  @ViewChild('mobileIngredientSearch') mobileIngredientSearch!: IngredientSearch;
  @ViewChild('mobileSearchToggle') mobileSearchToggle!: ElementRef<HTMLInputElement>;

  constructor() {
    this.updateRouteState(this.router.url);
    this.router.events
      .pipe(filter(ev => ev instanceof NavigationEnd))
      .subscribe((ev: NavigationEnd) => this.updateRouteState(ev.urlAfterRedirects || ev.url));
  }

  private updateRouteState(url: string) {
    const path = url || '';
    this.isRecipePage.set(path.startsWith('/recipe'));
  }

  openSidebarItems(event: Event) {
    this.configurationService.toggleSidebarItemsStatus('open');
    (event.currentTarget as HTMLButtonElement | null)?.blur();
  }

  onMobileToggleEnd(event: Event) {
    const el = event.target as HTMLInputElement;
    if (el && el.checked) {
      setTimeout(() => {
        if (this.isRecipePage()) {
          this.mobileIngredientSearch?.searchInput?.nativeElement?.focus();
        } else {
          this.mobileSearch?.focusInput();
        }
      }, 0);
    }
  }

  private closeMobileSearchOverlay() {
    const cb = this.mobileSearchToggle?.nativeElement as HTMLInputElement | undefined;
    if (cb && cb.checked) {
      cb.checked = false;
      cb.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  onSearchSubmitted() {
    this.closeMobileSearchOverlay();
  }

  onSearchDismissed() {
    this.closeMobileSearchOverlay();
  }
}
