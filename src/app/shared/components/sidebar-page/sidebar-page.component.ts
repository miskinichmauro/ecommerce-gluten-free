import { Component, inject, signal, effect } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/auth/auth.service';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'sidebar-page',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './sidebar-page.component.html',
  styleUrl: './sidebar-page.component.css',
})
export class SidebarPageComponent {
  private router = inject(Router);
  authService = inject(AuthService);
  sidebarService = inject(SidebarService);
  open = signal(false);
  currentRoute = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.open.set(this.sidebarService.sidebarOpen());
    });
  }

  openPage(route: string) {
    this.currentRoute.set(route);
    this.router.navigateByUrl(route);
    this.open.set(true);
  }

  close() {
    this.open.set(false);
    this.currentRoute.set(null);
  }
}
