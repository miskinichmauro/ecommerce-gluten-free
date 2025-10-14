import { inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";

type sidebarStatus = 'closed' | 'open';

@Injectable({ providedIn: 'root' })
export class ConfigurationService {
  router = inject(Router);

  sidebarItemsStatus = signal<sidebarStatus>('closed');
  sidebarPageStatus = signal<sidebarStatus>('closed');
  sidebarPageRoute = signal<string>('');

  toggleSidebarItemsStatus(value: sidebarStatus) {
    this.sidebarItemsStatus.set(value);
  }

  toggleSidebarPageStatus(value: sidebarStatus) {
    this.router.navigate([{ outlets: { sidebar: null } }]);
    this.sidebarPageStatus.set(value);
  }

  toggleSidebarPageRoute(value: string[]) {
    const path = value.join('/');
    this.sidebarPageRoute.set(path);
  }
}
