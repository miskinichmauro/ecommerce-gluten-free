import { Component, inject, input  } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { LogoComponent } from "src/app/shared/components/logo/logo.component";
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from 'src/app/store-front/components/interfaces/menu-item.interface';
import { ConfigurationService } from '../../services/configuration.service';
import { NavOptionsComponent } from "../nav-options/nav-options.component";

@Component({
  selector: 'navbar',
  imports: [LogoComponent, RouterLink, RouterLinkActive, NavOptionsComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  menuItems = input.required<MenuItem[]>();

  authService = inject(AuthService);
  configurationService = inject(ConfigurationService);
}
