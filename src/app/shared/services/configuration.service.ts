import { Injectable, signal } from "@angular/core";

type sidebarStatus = 'closed' | 'open';

@Injectable({ providedIn: 'root' })
export class ConfigurationService {
  sidebarItemsStatus = signal<sidebarStatus>('closed');
  sidebarPageStatus = signal<sidebarStatus>('closed');
  sidebarPageRoute = signal<string>('');

  toggleSidebarItemsStatus(value: sidebarStatus) {
    this.sidebarItemsStatus.set(value);
  }

  toggleSidebarPageStatus(value: sidebarStatus) {
    this.sidebarPageStatus.set(value);
  }

  toggleSidebarPageRoute(value: string[]) {
    const path = value.join('/');
    this.sidebarPageRoute.set(path);
  }
}
