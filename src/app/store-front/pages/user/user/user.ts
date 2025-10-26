import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-user',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './user.html',
  styleUrl: './user.css',
})
export class User { }
