import { Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map, firstValueFrom } from 'rxjs';
import { Role } from 'src/app/roles/interfaces/role.interface';
import { RoleService } from 'src/app/roles/services/role.services';
import { LoadingComponent } from "@shared/components/loading/loading.component";
import { RoleDetailsComponent } from "./role-details/role-details.component";

@Component({
  selector: 'role-admin',
  imports: [LoadingComponent, RoleDetailsComponent],
  templateUrl: './role-admin.component.html',
  styleUrl: './role-admin.component.css',
})
export class RoleAdminComponent {
  private activateRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private roleService = inject(RoleService);

  roleId = toSignal(
    this.activateRoute.params.pipe(
      map(params => params['id'])
    )
  );

  role = signal<Role | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  constructor() {
    effect(() => {
      const id = this.roleId();
      this.loadRol(id);
    });
  }

  private async loadRol(id: string) {
    this.loading.set(true);
    this.error.set(null);

    try {
      const role = await firstValueFrom(this.roleService.getById(id));
      this.role.set(role);
    } catch (err) {
      this.error.set('Error al cargar el rol');
      this.router.navigate(['/admin/roles']);
    } finally {
      this.loading.set(false);
    }
  }
}
