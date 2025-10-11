import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { MENU_ITEMS } from '../menu-items';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'front-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './front-sidebar.component.html',
  styleUrl: './front-sidebar.component.css',
})
export class FrontSidebarComponent {
  @Input() menuItems = MENU_ITEMS;
  @Input() open = false;
  @Output() closeSidebar = new EventEmitter<void>();

  constructor(public authService: AuthService) {}

  close() {
    this.closeSidebar.emit();
  }
}
