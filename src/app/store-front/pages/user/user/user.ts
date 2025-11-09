import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '@auth/auth.service';

@Component({
  selector: 'app-user',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './user.html',
  styleUrl: './user.css',
})
export class User {
  public readonly authService = inject(AuthService);
}
