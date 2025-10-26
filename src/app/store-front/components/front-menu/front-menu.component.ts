import { Component, HostListener, inject } from '@angular/core';
import { MENU_ITEMS } from '../menu-items';
import { Router } from '@angular/router';
import { NavbarComponent } from '@shared/components/navbar/navbar.component';
import { AuthService } from '@auth/auth.service';
import { LogoComponent } from '@shared/components/logo/logo.component';
import { NavUserOptionsComponent } from '@shared/components/nav-options/nav-user-options.component';
import { SidebarItemsComponent } from '@shared/components/sidebar-items/sidebar-items.component';
import { ConfigurationService } from '@shared/services/configuration.service';

@Component({
  selector: 'front-menu',
  imports: [NavbarComponent, SidebarItemsComponent, LogoComponent, NavUserOptionsComponent],
  templateUrl: './front-menu.component.html',
  styleUrl: './front-menu.component.css',
})
export class FrontMenuComponent {
  authService = inject(AuthService);
  router = inject(Router);
  configurationService = inject(ConfigurationService);
  menuItems = MENU_ITEMS;
  isMobile = false;

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth < 1024;
  }

  ngOnInit() {
    this.onResize();
  }
}
