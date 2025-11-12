import { Component, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from '@shared/components/navbar/navbar.component';
import { AuthService } from '@auth/auth.service';
import { ConfigurationService } from '@shared/services/configuration.service';

@Component({
  selector: 'front-menu',
  imports: [NavbarComponent],
  templateUrl: './front-menu.component.html',
  styleUrl: './front-menu.component.css',
})
export class FrontMenuComponent {
  authService = inject(AuthService);
  router = inject(Router);
  configurationService = inject(ConfigurationService);
  isMobile = false;

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth < 1024;
  }

  ngOnInit() {
    this.onResize();
  }
}
