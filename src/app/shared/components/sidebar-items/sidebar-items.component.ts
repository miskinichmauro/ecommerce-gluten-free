import { Component, HostListener, inject, input, signal } from '@angular/core';
import { MenuItem } from 'src/app/store-front/components/interfaces/menu-item.interface';
import { ConfigurationService } from '../../services/configuration.service';
import { MenuItemsComponent } from '@shared/components/menu-items/menu-items.component';
import { XCircle } from "../x-circle/x-circle";
import { MobileProductFiltersComponent } from 'src/app/store-front/components/mobile-product-filters/mobile-product-filters.component';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'sidebar-items',
  imports: [MenuItemsComponent, XCircle, MobileProductFiltersComponent],
  templateUrl: './sidebar-items.component.html',
  styleUrl: './sidebar-items.component.css',
})
export class SidebarItemsComponent {
  menuItems = input.required<MenuItem[]>();

  configurationService = inject(ConfigurationService);
  private router = inject(Router);

  showProductFilters = signal(false);
  isOnProducts = signal(false);
  isMobile = signal(false);

  constructor() {
    this.isOnProducts.set(this.router.url.startsWith('/products'));
    this.isMobile.set(window.innerWidth < 1024);
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe((e) => {
      const onProducts = e.urlAfterRedirects.startsWith('/products');
      this.isOnProducts.set(onProducts);
      if (!onProducts) this.showProductFilters.set(false);
    });
  }

  isOpen() : boolean {
    return this.configurationService.sidebarItemsStatus() === 'open';
  }

  close() {
    this.configurationService.toggleSidebarItemsStatus('closed');
  }

  @HostListener('window:keydown', ['$event'])
  handleEscape(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.isOpen()) {
      this.close();
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.isMobile.set(window.innerWidth < 1024);
  }

  toggleProductFilters() {
    this.showProductFilters.update((v) => !v);
  }

  interceptMenuClick = (item: MenuItem): boolean => {
    if (this.isMobile() && item.routerLink === '/products') {
      this.toggleProductFilters();
      return true; // stop navigation
    }
    return false;
  };
}
