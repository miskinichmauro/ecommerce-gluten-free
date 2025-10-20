import { inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";

type sidebarStatus = 'closed' | 'open';
type sidebarPageRoute = 'auth' | 'userOptions' | 'cart';

@Injectable({ providedIn: 'root' })
export class ConfigurationService {
  router = inject(Router);

  sidebarItemsStatus = signal<sidebarStatus>('closed');
  sidebarPageStatus = signal<sidebarStatus>('closed');
  sidebarPageRouteName = signal<string>('');

  toggleSidebarItemsStatus(value: sidebarStatus) {
    this.sidebarItemsStatus.set(value);
  }

  toggleSidebarPageStatus(value: sidebarStatus) {
    this.sidebarPageStatus.set(value);
  }

  toggleSidebarPageRoute(value: sidebarPageRoute) {
    this.sidebarPageRouteName.set(value);
  }
}
