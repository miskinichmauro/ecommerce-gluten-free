import { Component, inject } from '@angular/core';
import { AuthService } from '@auth/auth.service';
import { MenuItem } from 'src/app/store-front/components/interfaces/menu-item.interface';
import { MenuItemsComponent } from "@shared/components/menu-items/menu-items.component";
import { ConfigurationService } from 'src/app/shared/services/configuration.service';

@Component({
  selector: 'user-sidebar-options',
  imports: [MenuItemsComponent],
  templateUrl: './user-sidebar-options.component.html',
  styleUrl: './user-sidebar-options.component.css',
})
export class UserOptionsComponent {
  authService = inject(AuthService);
  configurationService = inject(ConfigurationService);

  menuItems: MenuItem[] = [
    { label: 'Mi perfil', routerLink: '/user/profile' },
    { label: 'Mis direcciones', routerLink: '/user/directions' },
    { label: 'Mis datos de facturación', routerLink: '/user/billing' },
    { label: 'Mis pedidos', routerLink: '/user/recipes' },
    { label: 'Panel administrativo', routerLink: '/admin', adminOnly: true },
  ];
}
