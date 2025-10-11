import { Component, HostListener, inject } from '@angular/core';
import { FrontNavbarComponent } from '../front-navbar/front-navbar.component';
import { FrontSidebarComponent } from '../front-sidebar/front-sidebar.component';
import { MENU_ITEMS } from '../menu-items';

@Component({
  selector: 'front-menu',
  imports: [FrontNavbarComponent, FrontSidebarComponent],
  templateUrl: './front-menu.component.html',
  styleUrl: './front-menu.component.css',
})
export class FrontMenuComponent {
  menuItems = MENU_ITEMS;
  isMobile = false;
  sidebarOpen = false;

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth < 1024;
  }

  ngOnInit() {
    this.onResize();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
