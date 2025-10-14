import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { RouterLink } from "@angular/router";
import { LogoComponent } from "src/app/shared/components/logo/logo.component";
import { SidebarItemsComponent } from "src/app/shared/components/sidebar-items/sidebar-items.component";
import { MENU_ADMIN_ITEMS } from 'src/app/store-front/components/menu-admin-items';
import { ConfigurationService } from 'src/app/shared/services/configuration.service';
import { ToastComponent } from "src/app/shared/components/toast/toast.component";

@Component({
  selector: 'app-admin-dashboard-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LogoComponent, SidebarItemsComponent, ToastComponent],
  templateUrl: './admin-dashboard-layout.component.html',
  styleUrl: './admin-dashboard-layout.component.css',
})
export class AdminDashboardLayoutComponent {
  authService = inject(AuthService);
  configurationService = inject(ConfigurationService);
  user = computed(() => this.authService.user());
  menuItems = MENU_ADMIN_ITEMS;
  isMobile = false;

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth < 1024;
  }

  ngOnInit() {
    this.onResize();
  }
}
