import { Component, inject, OnInit } from '@angular/core';

@Component({
  selector: 'theme-controller',
  templateUrl: './theme-controller.html',
  styleUrls: ['./theme-controller.css']
})
export class ThemeController implements OnInit {
  ngOnInit() {
    document.documentElement.setAttribute('data-theme', 'emerald');
    const checkbox = document.querySelector<HTMLInputElement>('.theme-controller');
    if (checkbox) {
      checkbox.checked = true;
    }
  }

  toggleTheme(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const theme = checkbox.checked ? 'coffee' : 'emerald';

    document.documentElement.setAttribute('data-theme', theme);
    checkbox.blur();
  }
}
