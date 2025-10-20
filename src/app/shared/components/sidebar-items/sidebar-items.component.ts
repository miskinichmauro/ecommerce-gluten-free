import { Component, inject, input } from '@angular/core';
import { MenuItem } from 'src/app/store-front/components/interfaces/menu-item.interface';
import { ConfigurationService } from '../../services/configuration.service';
import { MenuItemsComponent } from '@shared/components/menu-items/menu-items.component';

@Component({
  selector: 'sidebar-items',
  imports: [MenuItemsComponent],
  templateUrl: './sidebar-items.component.html',
  styleUrl: './sidebar-items.component.css',
})
export class SidebarItemsComponent {
  menuItems = input.required<MenuItem[]>();

  configurationService = inject(ConfigurationService);

  open() : boolean {
    return this.configurationService.sidebarItemsStatus() === 'open';
  }
}
