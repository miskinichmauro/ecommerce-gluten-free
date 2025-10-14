import { inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";

type sidebarStatus = 'closed' | 'open';

@Injectable({ providedIn: 'root' })
export class ConfigurationService {
  router = inject(Router);

  sidebarItemsStatus = signal<sidebarStatus>('closed');
  sidebarPageStatus = signal<sidebarStatus>('closed');
  sidebarPageRoute = signal<string>('');

  loading = signal<boolean>(false);
  success = signal<boolean>(false);

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

  async toggleToast() {
    console.log('toast activated');
    this.loading.set(false);
    this.success.set(true);
    await new Promise(res => setTimeout(res, 800));

    console.log('toast closed');
    this.success.set(false);
  }
}
