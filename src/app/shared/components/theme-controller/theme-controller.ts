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
    this.themeService.isDarkTheme.set(false);
    document.documentElement.setAttribute('data-theme', 'emerald');
    const checkbox = document.querySelector<HTMLInputElement>('.theme-controller');
    if (checkbox) {
      checkbox.checked = true;
    }
  }

  toggleTheme(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const theme = checkbox.checked ? 'coffee' : 'emerald';
    this.themeService.isDarkTheme.set(!checkbox.checked);

    document.documentElement.setAttribute('data-theme', theme);
  }
}
