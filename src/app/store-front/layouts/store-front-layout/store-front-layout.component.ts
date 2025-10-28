import { Component, inject } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { FrontMenuComponent } from "../../components/front-menu/front-menu.component";
import { ConfigurationService } from 'src/app/shared/services/configuration.service';
import { Footer } from "@shared/components/footer/footer";
import { SidebarPageComponent } from "@shared/components/sidebar-page/sidebar-page.component";

@Component({
  selector: 'app-store-front-layout',
  imports: [RouterOutlet, FrontMenuComponent, SidebarPageComponent, Footer],
  templateUrl: './store-front-layout.component.html',
})
export class StoreFrontLayoutComponent {
  configurationService = inject(ConfigurationService);
  constructor() {
    this.configurationService.toggleSidebarItemsStatus('closed');
  }
}
