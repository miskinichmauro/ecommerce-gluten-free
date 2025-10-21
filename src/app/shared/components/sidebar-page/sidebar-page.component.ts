import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/auth/auth.service';
import { ConfigurationService } from '../../services/configuration.service';

@Component({
  selector: 'sidebar-page',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './sidebar-page.component.html',
  styleUrl: './sidebar-page.component.css',
})
export class SidebarPageComponent {
  authService = inject(AuthService);
  configurationService = inject(ConfigurationService);

  open() : boolean {
    return this.configurationService.sidebarPageStatus() === 'open';
  }

  close() {
    this.configurationService.toggleSidebarPageStatus('closed');
  }

  getTitle() {
    const pageName = this.configurationService.sidebarPageRouteName();
    if (pageName === 'auth') {
      return 'Iniciar sesión';
    } else if (pageName === 'userOptions') {
      return 'Hola, ' + this.authService.user()?.fullName
    } else {
      return 'Mi carrito';
    }
  }
}
