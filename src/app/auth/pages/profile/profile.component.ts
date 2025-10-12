import { Component, inject } from '@angular/core';
import { AuthService } from '../../auth.service';
import { MenuItem } from 'src/app/store-front/components/interfaces/menu-item.interface';
import { NavItemsComponent } from "src/app/shared/components/nav-items/nav-items.component";
import { ConfigurationService } from 'src/app/shared/services/configuration.service';

@Component({
  selector: 'profile',
  imports: [NavItemsComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  constructor() {
    console.log('ProfileComponent');
  }

  authService = inject(AuthService);
  configurationService = inject(ConfigurationService);

  menuItems: MenuItem[] = [
    {
      label: 'Mis datos',
      route: '/user/profile',
      adminOnly: false
    },
    {
      label: 'Mis pedidos',
      route: '/recipes/history',
      adminOnly: false
    }
  ]
}
