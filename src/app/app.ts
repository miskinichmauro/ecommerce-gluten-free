import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  setTheme(event: Event) {
    const select = event.target as HTMLSelectElement;
    const tema = select.value;
    document.documentElement.setAttribute('data-theme', tema);
  }
}
