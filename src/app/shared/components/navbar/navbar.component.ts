import { Component, inject, input  } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ConfigurationService } from '../../services/configuration.service';
import { NavUserOptionsComponent } from "../nav-options/nav-user-options.component";
import { AuthService } from '@auth/auth.service';
import { MenuItem } from '@store-front/components/interfaces/menu-item.interface';
import { LogoComponent } from '../logo/logo.component';


@Component({
  selector: 'navbar',
  imports: [LogoComponent, RouterLink, RouterLinkActive, NavUserOptionsComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  menuItems = input.required<MenuItem[]>();

  authService = inject(AuthService);
  configurationService = inject(ConfigurationService);

  menuItemsDefault(): MenuItem[]{
    return this.menuItems().filter(item => !item.adminOnly);
  }

  menuItemsAdmin(): MenuItem[] | null {
    if (this.authService.isAdmin()) {
      return this.menuItems().filter(item => item.adminOnly);
    }
    return null;
  }
}
