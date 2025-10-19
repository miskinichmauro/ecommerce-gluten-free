import { Component, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Role } from 'src/app/users/roles/interfaces/role.interface';
import { RoleService } from 'src/app/users/roles/services/role.services';
import { LoadingComponent } from "@shared/components/loading/loading.component";
import { RolesTableComponent } from "src/app/users/roles/components/roles-table/roles-table.component";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'roles-admin',
  imports: [RouterLink, LoadingComponent, RolesTableComponent],
  templateUrl: './roles-admin.component.html',
  styleUrl: './roles-admin.component.css',
})
export class RolesAdminComponent {
  private rolService = inject(RoleService);

  roles = signal<Role[] | null>(null);
  total = computed(() => this.roles()?.length ?? 0);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.getRoles();
  }

  async getRoles() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const data = await firstValueFrom(this.rolService.getAll());
      this.roles.set(data);
    } catch (err) {
      this.error.set('Error al cargar los roles');
    } finally {
      this.loading.set(false);
    }
  }

  async delete(id: string) {
    try {
      await firstValueFrom(this.rolService.delete(id));
      this.roles.set(this.roles()?.filter(r => r.id !== id)!);
    } catch (err) {
      console.error('Error al eliminar', err);
      this.error.set('No se pudo eliminar el rol.');
    }
  }
}
