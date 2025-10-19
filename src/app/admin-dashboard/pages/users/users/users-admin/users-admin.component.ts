import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { User } from 'src/app/users/users/interfaces/user.interfase';
import { UserService } from 'src/app/users/users/services/user.service';
import { LoadingComponent } from "@shared/components/loading/loading.component";
import { UsersTableComponent } from "src/app/users/users/components/users-table/users-table.component";

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
