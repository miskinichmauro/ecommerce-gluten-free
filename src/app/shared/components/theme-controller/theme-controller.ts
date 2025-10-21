import { Component, inject, signal } from '@angular/core';
import { ThemeService } from '@shared/services/theme.service';

@Component({
  selector: 'theme-controller',
  imports: [],
  templateUrl: './theme-controller.html',
  styleUrl: './theme-controller.css',
})
export class ThemeController {
  themeService = inject(ThemeService);

  toggleTheme(event: Event) {
    const checkbox = event.target as HTMLInputElement;

    const theme = checkbox.checked ? 'forest' : 'winter';
    this.themeService.isDarkTheme.set(checkbox.checked);

    document.documentElement.setAttribute('data-theme', theme);
  }
}
