import { Component, computed, HostListener, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigurationService } from '../../services/configuration.service';
import { AuthService } from 'src/app/auth/auth.service';
import { UserOptionsComponent } from 'src/app/store-front/pages/user/user-sidebar-options/user-sidebar-options.component';
import { LoginComponent } from 'src/app/auth/pages/login/login.component';
import { CartSidebarComponent } from 'src/app/store-front/pages/cart/cart-sidebar/cart-sidebar.component';
import { XCircle } from "../x-circle/x-circle";
import { RegisterComponent } from 'src/app/auth/pages/register/register.component';

@Component({
  selector: 'sidebar-page',
  standalone: true,
  imports: [CommonModule, UserOptionsComponent, LoginComponent, RegisterComponent, CartSidebarComponent, XCircle],
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
      case 'register':
        return 'Crear cuenta';
      case 'userOptions':
        return 'Hola, ' + (this.authService.user()?.fullName ?? '');
      case 'cartSidebar':
        return 'Mi carrito';
      default:
        return '';
    }
  });

  constructor() {
    effect(() => {
      const status = this.open();
      if (status === 'open') {
        this.lockBodyScroll();
      } else {
        this.unlockBodyScroll();
      }
    });
  }

  close() {
    this.configurationService.closeSidebar();
  }

  @HostListener('window:keydown', ['$event'])
  handleEscape(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.open() === 'open') {
      this.close();
    }
  }

  private lockBodyScroll() {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
  }

  private unlockBodyScroll() {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
  }
}

