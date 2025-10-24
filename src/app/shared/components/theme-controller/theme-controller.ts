import { Component, inject, OnInit } from '@angular/core';
import { ThemeService } from '@shared/services/theme.service';

@Component({
  selector: 'theme-controller',
  templateUrl: './theme-controller.html',
  styleUrls: ['./theme-controller.css']
})
export class ThemeController implements OnInit {
  themeService = inject(ThemeService);

  ngOnInit() {
    const isDark = true;
    const theme = isDark ? 'business' : 'winter';
    this.themeService.isDarkTheme.set(isDark);

    document.documentElement.setAttribute('data-theme', theme);

    const checkbox = document.querySelector<HTMLInputElement>('.theme-controller');
    if (checkbox) checkbox.checked = isDark;
  }

  toggleTheme(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const theme = checkbox.checked ? 'winter' : 'business' ;
    this.themeService.isDarkTheme.set(!checkbox.checked);

    document.documentElement.setAttribute('data-theme', theme);
  }
}
