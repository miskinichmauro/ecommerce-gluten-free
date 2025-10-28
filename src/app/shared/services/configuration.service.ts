import { inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";

export type SidebarStatus = 'closed' | 'open';
export type SidebarPageRoute = 'auth' | 'userOptions' | 'cartSidebar' | '';

@Injectable({ providedIn: 'root' })
export class ConfigurationService {
  router = inject(Router);

  sidebarItemsStatus = signal<SidebarStatus>('closed');
  sidebarPageStatus = signal<SidebarStatus>('closed');
  sidebarPageRouteName = signal<SidebarPageRoute>('');

  toggleSidebarItemsStatus(value: SidebarStatus) {
    this.sidebarItemsStatus.set(value);
  }

  toggleSidebarPageStatus(value: SidebarStatus) {
    this.sidebarPageStatus.set(value);
  }

  toggleSidebarPageRoute(value: SidebarPageRoute) {
    this.sidebarPageRouteName.set(value);
  }

  openSidebar(page: SidebarPageRoute) {
    this.sidebarPageRouteName.set(page);
    this.sidebarPageStatus.set('open');
  }

  closeSidebar() {
    this.sidebarPageStatus.set('closed');
    setTimeout(() => this.sidebarPageRouteName.set(''), 300);
  }
}
