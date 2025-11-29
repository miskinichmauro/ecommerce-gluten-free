import { Component, computed, HostListener, inject, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { LogoComponent } from 'src/app/shared/components/logo/logo.component';
import { SidebarItemsComponent } from 'src/app/shared/components/sidebar-items/sidebar-items.component';
import { MENU_ADMIN_ITEMS } from 'src/app/store-front/components/menu-admin-items';
import { ConfigurationService } from 'src/app/shared/services/configuration.service';
import { ToastComponent } from 'src/app/shared/components/toast/toast.component';
import { ToastService } from '@shared/services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LogoComponent, SidebarItemsComponent, ToastComponent],
  templateUrl: './admin-dashboard-layout.component.html',
  styleUrl: './admin-dashboard-layout.component.css',
})
export class AdminDashboardLayoutComponent implements OnDestroy {
  authService = inject(AuthService);
  configurationService = inject(ConfigurationService);
  user = computed(() => this.authService.user());
  menuItems = MENU_ADMIN_ITEMS;
  isMobile = false;
  userMenuOpen = false;
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private routerEventsSubscription?: Subscription;

  ngOnInit() {
    this.onResize();
    this.routerEventsSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.toastService.activateLoading();
      }

      if (event instanceof NavigationEnd) {
        this.toastService.deactivateLoading();
      }

      if (event instanceof NavigationCancel || event instanceof NavigationError) {
        this.toastService.deactivateLoading();
      }
    });
  }

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth < 1024;
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }
  
  ngOnDestroy(): void {
    this.routerEventsSubscription?.unsubscribe();
  }
}
