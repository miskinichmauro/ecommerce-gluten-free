import { Component, Input, inject, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'sidebar-page',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './sidebar-page.component.html',
  styleUrl: './sidebar-page.component.css',
})
export class SidebarPageComponent {
  private router = inject(Router);

  open = signal(false);
  currentRoute = signal<string | null>(null);

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
