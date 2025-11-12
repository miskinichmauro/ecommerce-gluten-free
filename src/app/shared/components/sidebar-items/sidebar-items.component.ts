import { Component, HostListener, inject, input } from '@angular/core';
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

  isOpen() : boolean {
    return this.configurationService.sidebarItemsStatus() === 'open';
  }

  close() {
    this.configurationService.closeSidebar();
  }

  @HostListener('window:keydown', ['$event'])
  handleEscape(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.isOpen()) {
      this.close();
    }
  }
}
