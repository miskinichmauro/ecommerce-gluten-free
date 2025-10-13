import { Component, inject } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';
import { MenuItem } from 'src/app/store-front/components/interfaces/menu-item.interface';
import { NavItemsComponent } from "src/app/shared/components/nav-items/nav-items.component";
import { ConfigurationService } from 'src/app/shared/services/configuration.service';

@Component({
  selector: 'user',
  imports: [NavItemsComponent],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css',
})
export class UserComponent {
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
