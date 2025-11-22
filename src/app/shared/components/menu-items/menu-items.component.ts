import { Component, inject, input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, UrlTree } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { MenuItem } from 'src/app/store-front/components/interfaces/menu-item.interface';
import { ConfigurationService } from '../../services/configuration.service';

@Component({
  selector: 'menu-items',
  imports: [],
  templateUrl: './menu-items.component.html',
  styleUrl: './menu-items.component.css',
})
export class MenuItemsComponent {
  menuItems = input.required<MenuItem[]>();
  interceptor = input<((item: MenuItem) => boolean) | undefined>(undefined);

  authService = inject(AuthService);
  configurationService = inject(ConfigurationService);
  router = inject(Router);

  handleOnClick(routerLink: any, item: MenuItem) {
    const intercept = this.interceptor();
    if (intercept && intercept(item)) {
      return;
    }

    this.configurationService.toggleSidebarItemsStatus('closed');
    this.configurationService.toggleSidebarPageStatus('closed');

    if (typeof routerLink === 'string') {
      this.router.navigateByUrl(routerLink);
    } else {
      this.router.navigate([routerLink]);
    }
  }
}
