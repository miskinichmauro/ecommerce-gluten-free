import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigurationService } from '../../services/configuration.service';
import { AuthService } from 'src/app/auth/auth.service';
import { UserOptionsComponent } from 'src/app/store-front/pages/user/user-sidebar-options/user-sidebar-options.component';
import { LoginComponent } from 'src/app/auth/pages/login/login.component';
import { CartSidebarComponent } from 'src/app/store-front/pages/cart/cart-sidebar/cart-sidebar.component';

@Component({
  selector: 'sidebar-page',
  standalone: true,
  imports: [CommonModule, UserOptionsComponent, LoginComponent, CartSidebarComponent],
  templateUrl: './sidebar-page.component.html',
  styleUrl: './sidebar-page.component.css',
})
export class SidebarPageComponent {
  authService = inject(AuthService);
  configurationService = inject(ConfigurationService);

  open = this.configurationService.sidebarPageStatus;
  routeName = this.configurationService.sidebarPageRouteName;

  getTitle = computed(() => {
    switch (this.routeName()) {
      case 'auth':
        return 'Iniciar sesión';
      case 'userOptions':
        return 'Hola, ' + (this.authService.user()?.fullName ?? '');
      case 'cartSidebar':
        return 'Mi carrito';
      default:
        return '';
    }
  });

  close() {
    this.configurationService.closeSidebar();
  }
}
