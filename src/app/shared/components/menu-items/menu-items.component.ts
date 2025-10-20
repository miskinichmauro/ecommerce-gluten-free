import { Component, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { MenuItem } from 'src/app/store-front/components/interfaces/menu-item.interface';
import { ConfigurationService } from '../../services/configuration.service';

@Component({
  selector: 'menu-items',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './menu-items.component.html',
  styleUrl: './menu-items.component.css',
})
export class MenuItemsComponent {
  menuItems = input.required<MenuItem[]>();

  authService = inject(AuthService);
  configurationService = inject(ConfigurationService);
}
