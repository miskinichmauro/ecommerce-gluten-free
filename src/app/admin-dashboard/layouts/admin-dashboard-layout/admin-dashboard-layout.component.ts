import { Component, computed, inject } from '@angular/core';
import { RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-admin-dashboard-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-dashboard-layout.component.html',
  styleUrl: './admin-dashboard-layout.component.css',
})
export class AdminDashboardLayoutComponent {
  authService = inject(AuthService);

  user = computed(() => this.authService.user());
}
