import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'front-navbar',
  imports: [
    RouterLink, RouterLinkActive
  ],
  templateUrl: './front-navbar.component.html',
  styleUrl: './front-navbar.component.css',
})
export class FrontNavbarComponent {
  authService = inject(AuthService);
}
