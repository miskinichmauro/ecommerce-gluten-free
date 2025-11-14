import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { ConfigurationService } from '../../services/configuration.service';
import { ThemeController } from "../theme-controller/theme-controller";

@Component({
  selector: 'nav-user-options',
  imports: [ThemeController],
  templateUrl: './nav-user-options.component.html',
  styleUrl: './nav-user-options.component.css',
})
export class NavUserOptionsComponent {
  @ViewChild('mobileSearchToggle') mobileSearchToggle!: ElementRef<HTMLInputElement>;
  authService = inject(AuthService);
  configurationService = inject(ConfigurationService);

  private blurTarget(event?: Event) {
    (event?.currentTarget as HTMLElement | null)?.blur();
  }

  openUserOptions(event?: Event) {
    this.blurTarget(event);
    if (this.authService.authStatus() === 'authenticated') {
      this.configurationService.openSidebar('userOptions');
    } else {
      this.configurationService.openSidebar('auth');
    }
  }

  openCart(event?: Event) {
    this.blurTarget(event);
    this.configurationService.openSidebar('cartSidebar');
  }

  openMobileSearch(event?: Event) {
    this.blurTarget(event);
    const cb = this.mobileSearchToggle?.nativeElement as HTMLInputElement | undefined;
    if (!cb) return;
    cb.checked = true;
    cb.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

