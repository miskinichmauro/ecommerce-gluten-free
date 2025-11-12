import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { ReactiveFormsModule,  } from '@angular/forms';
import { LogoComponent } from '../logo/logo.component';
import { NavUserOptionsComponent } from "../nav-options/nav-user-options.component";
import { MENU_ITEMS } from '@store-front/components/menu-items';
import { SidebarItemsComponent } from "../sidebar-items/sidebar-items.component";
import { FormSearch } from "../form-search/form-search";
import { ConfigurationService } from '@shared/services/configuration.service';

@Component({
  selector: 'navbar',
  imports: [LogoComponent, NavUserOptionsComponent, ReactiveFormsModule, SidebarItemsComponent, FormSearch],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  configurationService = inject(ConfigurationService);

  menuItems = MENU_ITEMS;

  @ViewChild('mobileSearch') mobileSearch!: FormSearch;
  @ViewChild('mobileSearchToggle') mobileSearchToggle!: ElementRef<HTMLInputElement>;
  onMobileToggleEnd(event: Event) {
    const el = event.target as HTMLInputElement;
    if (el && el.checked) {
      setTimeout(() => this.mobileSearch?.focusInput(), 0);
    }
  }

  onSearchSubmitted() {
    const cb = this.mobileSearchToggle?.nativeElement as HTMLInputElement | undefined;
    if (cb && cb.checked) {
      cb.checked = false;
      cb.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
}
