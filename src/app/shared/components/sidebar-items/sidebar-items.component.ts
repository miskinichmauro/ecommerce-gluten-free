import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MENU_ITEMS } from 'src/app/store-front/components/menu-items';

@Component({
  selector: 'sidebar-items',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar-items.component.html',
  styleUrl: './sidebar-items.component.css',
})
export class SidebarItemsComponent {
  @Input() menuItems = MENU_ITEMS;
  @Input() open = false;
  @Output() closeSidebar = new EventEmitter<void>();

  constructor(public authService: AuthService) {}

  close() {
    this.closeSidebar.emit();
  }
}
