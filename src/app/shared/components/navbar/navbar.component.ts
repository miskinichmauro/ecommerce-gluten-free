import { Component, EventEmitter, inject, input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { LogoComponent } from "src/app/shared/components/logo/logo.component";
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from 'src/app/store-front/components/interfaces/menu-item.interface';
import { ConfigurationService } from '../../services/configuration.service';

@Component({
  selector: 'navbar',
  imports: [LogoComponent, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  menuItems = input.required<MenuItem[]>();

  authService = inject(AuthService);
  configurationService = inject(ConfigurationService);
  router = inject(Router);

  openUserOptions() {
    this.configurationService.toggleSidebarPageStatus('open');

    const sidebarRoute = this.authService.authStatus() === 'authenticated'
    ? ['user']
    : ['auth-sidebar', 'login'];

    this.configurationService.toggleSidebarPageRoute(sidebarRoute);
    this.router.navigate(
      [{ outlets: { sidebar: sidebarRoute } }],
      { skipLocationChange: true }
    );
  }

  closeSidebar() {
    this.router.navigate([{ outlets: { sidebar: null } }]);
    this.configurationService.toggleSidebarPageStatus('closed');
  }
}
