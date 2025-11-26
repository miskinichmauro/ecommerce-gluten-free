import { Component, HostListener, OnDestroy, effect, inject, input, signal } from '@angular/core';
import { MenuItem } from 'src/app/store-front/components/interfaces/menu-item.interface';
import { ConfigurationService } from '../../services/configuration.service';
import { XCircle } from "../x-circle/x-circle";
import { MobileProductFiltersComponent } from 'src/app/store-front/components/mobile-product-filters/mobile-product-filters.component';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'sidebar-items',
  imports: [XCircle, MobileProductFiltersComponent],
  templateUrl: './sidebar-items.component.html',
  styleUrl: './sidebar-items.component.css',
})
export class SidebarItemsComponent implements OnDestroy {
  menuItems = input.required<MenuItem[]>();

  configurationService = inject(ConfigurationService);
  private router = inject(Router);
  authService = inject(AuthService);

  showProductFilters = signal(false);
  isOnProducts = signal(false);
  isMobile = signal(false);
  private bodyOverflowBackup: string | null = null;
  private bodyPositionBackup: string | null = null;
  private bodyTopBackup: string | null = null;
  private bodyWidthBackup: string | null = null;
  private htmlOverflowBackup: string | null = null;
  private htmlPositionBackup: string | null = null;
  private scrollY = 0;

  constructor() {
    this.isOnProducts.set(this.router.url.startsWith('/products'));
    this.isMobile.set(window.innerWidth < 1024);
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe((e) => {
      const onProducts = e.urlAfterRedirects.startsWith('/products');
      this.isOnProducts.set(onProducts);
      if (!onProducts) this.showProductFilters.set(false);
    });

    effect(() => {
      const open = this.configurationService.sidebarItemsStatus() === 'open';
      if (open) {
        this.lockBodyScroll();
      } else {
        this.unlockBodyScroll();
      }
    });
  }

  ngOnDestroy() {
    this.unlockBodyScroll(true);
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

  handleProductClick() {
    if (this.isMobile()) {
      this.toggleProductFilters();
      return;
    }

    if (this.isOnProducts()) {
      this.toggleProductFilters();
      return;
    }

    this.showProductFilters.set(true);
    this.configurationService.toggleSidebarItemsStatus('closed');
    this.configurationService.toggleSidebarPageStatus('closed');
    this.router.navigateByUrl('/products');
  }

  handleMenuClick(item: MenuItem) {
    if (item.adminOnly && !this.authService.isAdmin()) return;

    this.configurationService.toggleSidebarItemsStatus('closed');
    this.configurationService.toggleSidebarPageStatus('closed');

    if (typeof item.routerLink === 'string') {
      this.router.navigateByUrl(item.routerLink);
    } else {
      this.router.navigate([item.routerLink]);
    }
  }

  private lockBodyScroll() {
    const bodyStyle = document.body.style;
    const htmlStyle = document.documentElement.style;
    if (this.bodyOverflowBackup === null) {
      this.bodyOverflowBackup = bodyStyle.overflow || '';
      this.bodyPositionBackup = bodyStyle.position || '';
      this.bodyTopBackup = bodyStyle.top || '';
      this.bodyWidthBackup = bodyStyle.width || '';
      this.htmlOverflowBackup = htmlStyle.overflow || '';
      this.htmlPositionBackup = htmlStyle.position || '';
    }
    this.scrollY = window.scrollY || window.pageYOffset || 0;
    htmlStyle.overflow = 'hidden';
    htmlStyle.position = 'fixed';
    bodyStyle.position = 'fixed';
    bodyStyle.top = `-${this.scrollY}px`;
    bodyStyle.width = '100%';
    bodyStyle.overflow = 'hidden';
  }

  private unlockBodyScroll(force = false) {
    const bodyStyle = document.body.style;
    const htmlStyle = document.documentElement.style;
    if (this.bodyOverflowBackup !== null || force) {
      htmlStyle.overflow = this.htmlOverflowBackup ?? '';
      htmlStyle.position = this.htmlPositionBackup ?? '';
      bodyStyle.overflow = this.bodyOverflowBackup ?? '';
      bodyStyle.position = this.bodyPositionBackup ?? '';
      bodyStyle.top = this.bodyTopBackup ?? '';
      bodyStyle.width = this.bodyWidthBackup ?? '';
      window.scrollTo(0, this.scrollY);
      this.bodyOverflowBackup = null;
      this.bodyPositionBackup = null;
      this.bodyTopBackup = null;
      this.bodyWidthBackup = null;
      this.htmlOverflowBackup = null;
      this.htmlPositionBackup = null;
    }
  }
}
