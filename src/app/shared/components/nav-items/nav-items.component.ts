import { Component, EventEmitter, inject, input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { MenuItem } from 'src/app/store-front/components/interfaces/menu-item.interface';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'nav-items',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav-items.component.html',
  styleUrl: './nav-items.component.css',
})
export class NavItemsComponent {
  menuItems = input.required<MenuItem[]>();
  authService = inject(AuthService);
  sidebarService = inject(SidebarService);
}
