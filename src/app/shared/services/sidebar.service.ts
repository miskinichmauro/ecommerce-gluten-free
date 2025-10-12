import { Injectable, signal } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class SidebarService {
  sidebarOpen = signal(false);

  openSidebar() {
    this.sidebarOpen.set(true);
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }
}
