import { Component, HostListener, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormErrorLabelComponent } from '@shared/components/form-error-label/form-error-label.component';
import { ConfigurationService } from '@shared/services/configuration.service';
import { firstValueFrom } from 'rxjs';
import { Role } from 'src/app/roles/interfaces/role.interface';
import { RoleService } from 'src/app/roles/services/role.services';

@Component({
  selector: 'role-details',
  imports: [ReactiveFormsModule, FormErrorLabelComponent],
  templateUrl: './role-details.component.html',
  styleUrl: './role-details.component.css',
})
export class RoleDetailsComponent {
  role = input.required<Role>();

  router = inject(Router);
  roleService = inject(RoleService);
  configurationService = inject(ConfigurationService);

  fb = inject(FormBuilder);

  roleForm = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
  });

  ngOnInit(): void {
    this.roleForm.reset(this.role());
  }

  async onSubmit() {
    this.roleForm.markAllAsTouched();
    const formValue = this.roleForm.value;

    const roleData: Partial<Role> = {
      ...(formValue as any),
    };

    if (this.role().id === 'new') {
      await firstValueFrom(this.roleService.create(roleData));
    } else {
      await firstValueFrom(this.roleService.update(this.role().id, roleData));
    }
    this.router.navigate(['/admin/roles']);
  }

  controlPresionado: boolean = false;
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Control') {
      this.controlPresionado = true;
    } else if (event.key === 'Enter' && this.controlPresionado) {
      this.onSubmit();
    }
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyboardUp(event: KeyboardEvent) {
    if (event.key === 'Control') {
      this.controlPresionado = false;
    }
  }
}
