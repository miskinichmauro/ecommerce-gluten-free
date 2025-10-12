import { Component, inject } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { FrontMenuComponent } from "../../components/front-menu/front-menu.component";
import { SidebarPageComponent } from "src/app/shared/components/sidebar-page/sidebar-page.component";
import { SidebarService } from 'src/app/shared/services/sidebar.service';

@Component({
  selector: 'app-store-front-layout',
  imports: [RouterOutlet, FrontMenuComponent, SidebarPageComponent],
  templateUrl: './store-front-layout.component.html',
})
export class StoreFrontLayoutComponent {
  sidebarService = inject(SidebarService);
  constructor() {
    this.sidebarService.closeSidebar();
  }
}
