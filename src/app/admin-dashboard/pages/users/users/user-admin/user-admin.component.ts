import { Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map, firstValueFrom } from 'rxjs';
import { User } from 'src/app/users/users/interfaces/user.interfase';
import { UserService } from 'src/app/users/users/services/user.service';
import { LoadingComponent } from "@shared/components/loading/loading.component";
import { UserDetailsComponent } from "./user-details/user-details.component";

@Component({
  selector: 'user-admin',
  imports: [LoadingComponent, UserDetailsComponent],
  templateUrl: './user-admin.component.html',
  styleUrl: './user-admin.component.css',
})
export class UserAdminComponent {
  private activateRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);

  userId = toSignal(
    this.activateRoute.params.pipe(
      map(params => params['id'])
    )
  );

  user = signal<User | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  constructor() {
    effect(() => {
      const id = this.userId();
      this.loadUser(id);
    });
  }

  private async loadUser(id: string) {
    this.loading.set(true);
    this.error.set(null);

    try {
      const user = await firstValueFrom(this.userService.getById(id));
      this.user.set(user);
    } catch (err) {
      this.error.set('Error al cargar el usuario');
      this.router.navigate(['/admin/users']);
    } finally {
      this.loading.set(false);
    }
  }
}
