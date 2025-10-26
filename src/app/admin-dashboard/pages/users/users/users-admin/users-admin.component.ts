import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LoadingComponent } from "@shared/components/loading/loading.component";
import { UsersTableComponent } from '@store-front/users/components/users-table/users-table.component';
import { UserService } from '@store-front/users/services/user.service';
import { User } from '@store-front/users/interfaces/user.interfase';

@Component({
  selector: 'app-users-admin',
  imports: [RouterLink, LoadingComponent, UsersTableComponent],
  templateUrl: './users-admin.component.html',
  styleUrl: './users-admin.component.css',
})
export class UsersAdminComponent {
  private userService = inject(UserService);

  users = signal<User[] | null>(null);
  total = computed(() => this.users()?.length ?? 0);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.getUsers();
  }

  async getUsers() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const data = await firstValueFrom(this.userService.getAll());
      this.users.set(data);
    } catch (err) {
      this.error.set('Error al cargar los usuarios');
    } finally {
      this.loading.set(false);
    }
  }

  async delete(id: string) {
    try {
      await firstValueFrom(this.userService.delete(id));
      this.users.set(this.users()?.filter(r => r.id !== id)!);
    } catch (err) {
      console.error('Error al eliminar', err);
      this.error.set('No se pudo eliminar el usuario.');
    }
  }
}
