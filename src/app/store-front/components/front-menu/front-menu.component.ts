import { Component, HostListener, inject } from '@angular/core';
import { NavbarComponent } from 'src/app/shared/components/navbar/navbar.component';
import { SidebarItemsComponent } from 'src/app/shared/components/sidebar-items/sidebar-items.component';
import { MENU_ITEMS } from '../menu-items';
import { LogoComponent } from "src/app/shared/components/logo/logo.component";
import { AuthService } from 'src/app/auth/auth.service';
import { ConfigurationService } from 'src/app/shared/services/configuration.service';

@Component({
  selector: 'front-menu',
  imports: [NavbarComponent, SidebarItemsComponent, LogoComponent],
  templateUrl: './front-menu.component.html',
  styleUrl: './front-menu.component.css',
})
export class FrontMenuComponent {
  authService = inject(AuthService);
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
