import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from "@angular/router";
import { FrontMenuComponent } from "../../components/front-menu/front-menu.component";
import { ConfigurationService } from 'src/app/shared/services/configuration.service';
import { Footer } from "@shared/components/footer/footer";
import { SidebarPageComponent } from "@shared/components/sidebar-page/sidebar-page.component";
import { ToastComponent } from '@shared/components/toast/toast.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-store-front-layout',
  imports: [RouterOutlet, FrontMenuComponent, SidebarPageComponent, Footer, ToastComponent],
  templateUrl: './store-front-layout.component.html',
})
export class StoreFrontLayoutComponent {
  configurationService = inject(ConfigurationService);
  private readonly router = inject(Router);
  showToast = signal(true);

  constructor() {
    this.configurationService.toggleSidebarItemsStatus('closed');
    this.updateToastVisibility(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.updateToastVisibility(e.urlAfterRedirects || e.url));
  }

  private updateToastVisibility(url: string) {
    this.showToast.set(!url.startsWith('/cart'));
  }
}
