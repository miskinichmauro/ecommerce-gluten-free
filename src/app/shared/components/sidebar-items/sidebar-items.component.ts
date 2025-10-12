import { Component, inject, input } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { MenuItem } from 'src/app/store-front/components/interfaces/menu-item.interface';
import { NavItemsComponent } from '../nav-items/nav-items.component';
import { ConfigurationService } from '../../services/configuration.service';

@Component({
  selector: 'sidebar-items',
  imports: [NavItemsComponent],
  templateUrl: './sidebar-items.component.html',
  styleUrl: './sidebar-items.component.css',
})
export class SidebarItemsComponent {
  menuItems = input.required<MenuItem[]>();
  
  authService = inject(AuthService);
  configurationService = inject(ConfigurationService);

  open() : boolean {
    return this.configurationService.sidebarItemsStatus() === 'open';
  }
}
