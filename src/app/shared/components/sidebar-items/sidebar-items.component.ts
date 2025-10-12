import { Component, EventEmitter, inject, input, Output } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { MenuItem } from 'src/app/store-front/components/interfaces/menu-item.interface';
import { NavItemsComponent } from '../nav-items/nav-items.component';

@Component({
  selector: 'sidebar-items',
  imports: [NavItemsComponent],
  templateUrl: './sidebar-items.component.html',
  styleUrl: './sidebar-items.component.css',
})
export class SidebarItemsComponent {
  menuItems = input.required<MenuItem[]>();
  open = input.required<boolean>();
  @Output() closeSidebar = new EventEmitter<void>();

  authService = inject(AuthService);

  close() {
    this.closeSidebar.emit();
  }
}
