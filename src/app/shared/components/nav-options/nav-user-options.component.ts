import { Component, inject } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { ConfigurationService } from '../../services/configuration.service';
import { ThemeController } from "../theme-controller/theme-controller";

@Component({
  selector: 'nav-user-options',
  imports: [ThemeController],
  templateUrl: './nav-user-options.component.html',
  styleUrl: './nav-user-options.component.css',
})
export class NavUserOptionsComponent {
  authService = inject(AuthService);
  configurationService = inject(ConfigurationService);

  openUserOptions() {
    if (this.authService.authStatus() === 'authenticated') {
      this.configurationService.openSidebar('userOptions');
    } else {
      this.configurationService.openSidebar('auth');
    }
  }

  openCart() {
    this.configurationService.openSidebar('cartSidebar');
  }
}
