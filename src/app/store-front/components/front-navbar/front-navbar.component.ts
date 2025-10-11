import { Component, Input } from '@angular/core';
import { MENU_ITEMS } from '../menu-items';
import { AuthService } from 'src/app/auth/auth.service';
import { LogoComponent } from "src/app/shared/components/logo/logo.component";
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'front-navbar',
  imports: [LogoComponent, RouterLink, RouterLinkActive],
  templateUrl: './front-navbar.component.html',
  styleUrl: './front-navbar.component.css',
})
export class FrontNavbarComponent {
  @Input() menuItems = MENU_ITEMS;

  constructor(public authService: AuthService) {}
}
