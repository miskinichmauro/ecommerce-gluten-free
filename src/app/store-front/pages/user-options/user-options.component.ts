import { Component, inject } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';
import { MenuItem } from 'src/app/store-front/components/interfaces/menu-item.interface';
import { NavItemsComponent } from "src/app/shared/components/nav-items/nav-items.component";
import { ConfigurationService } from 'src/app/shared/services/configuration.service';

@Component({
  selector: 'user-options',
  imports: [NavItemsComponent],
  templateUrl: './user-options.component.html',
  styleUrl: './user-options.component.css',
})
export class UserOptionsComponent {
  authService = inject(AuthService);
  configurationService = inject(ConfigurationService);

  menuItems: MenuItem[] = [
    {
      label: 'Mi perfil',
      route: '/user/profile',
      adminOnly: false
    },
    {
      label: 'Mis direcciones',
      route: '/user/directions',
      adminOnly: false
    },
    {
      label: 'Mis pedidos',
      route: '/user/recipes',
      adminOnly: false
    }
  ]
}
