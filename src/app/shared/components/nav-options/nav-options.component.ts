import { Component, inject } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { ConfigurationService } from '../../services/configuration.service';
import { Router } from '@angular/router';

@Component({
  selector: 'user-options',
  imports: [],
  templateUrl: './nav-options.component.html',
  styleUrl: './nav-options.component.css',
})
export class NavOptionsComponent {
  authService = inject(AuthService);
  configurationService = inject(ConfigurationService);
  router = inject(Router);

  openUserOptions() {
    this.configurationService.toggleSidebarPageStatus('open');

    let sidebarRoute = this.authService.authStatus() === 'authenticated'
      ? ['userOptions']
      : ['auth', 'login'];

    if (this.authService.authStatus() === 'authenticated') {
      this.configurationService.toggleSidebarPageRoute('userOptions');
    } else {
      this.configurationService.toggleSidebarPageRoute('auth');
    }

    this.router.navigate(
      [{ outlets: { sidebar: sidebarRoute } }],
      { skipLocationChange: true }
    );
  }

  openCart() {
    this.configurationService.toggleSidebarPageStatus('open');

    this.configurationService.toggleSidebarPageRoute('cart');
    this.router.navigate(
      [{ outlets: { sidebar: ['cart'] } }],
      { skipLocationChange: true }
    );
  }
}
