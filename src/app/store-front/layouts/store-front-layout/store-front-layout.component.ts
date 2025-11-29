import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterOutlet,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
import { FrontMenuComponent } from "../../components/front-menu/front-menu.component";
import { ConfigurationService } from 'src/app/shared/services/configuration.service';
import { Footer } from "@shared/components/footer/footer";
import { SidebarPageComponent } from "@shared/components/sidebar-page/sidebar-page.component";
import { ToastComponent } from '@shared/components/toast/toast.component';
import { ToastService } from '@shared/services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-store-front-layout',
  imports: [CommonModule, RouterOutlet, FrontMenuComponent, SidebarPageComponent, Footer, ToastComponent],
  templateUrl: './store-front-layout.component.html',
})
export class StoreFrontLayoutComponent implements OnDestroy {
  configurationService = inject(ConfigurationService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  showToast = signal(true);
  private readonly routerEventsSubscription: Subscription;

  constructor() {
    this.configurationService.toggleSidebarItemsStatus('closed');
    this.updateToastVisibility(this.router.url);
    this.routerEventsSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.showToast.set(true);
        this.toastService.activateLoading();
      }

      if (event instanceof NavigationEnd) {
        this.toastService.deactivateLoading();
        this.updateToastVisibility(event.urlAfterRedirects || event.url);
      }

      if (event instanceof NavigationCancel || event instanceof NavigationError) {
        this.toastService.deactivateLoading();
        this.updateToastVisibility(this.router.url);
      }
    });
  }

  private updateToastVisibility(url: string) {
    this.showToast.set(!url.startsWith('/cart'));
  }

  ngOnDestroy() {
    this.routerEventsSubscription.unsubscribe();
  }
}
