import { Component, EventEmitter, inject, input, Output } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { LogoComponent } from "src/app/shared/components/logo/logo.component";
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from 'src/app/store-front/components/interfaces/menu-item.interface';

@Component({
  selector: 'navbar',
  imports: [LogoComponent, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  menuItems = input.required<MenuItem[]>();
  @Output() openSidebarPage = new EventEmitter<string>();

  authService = inject(AuthService);

  onOpenLogin() {
    this.openSidebarPage.emit('/auth/login');
  }
}
