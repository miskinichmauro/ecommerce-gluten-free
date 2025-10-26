import { Component, HostListener, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormErrorLabelComponent } from '@shared/components/form-error-label/form-error-label.component';
import { ConfigurationService } from '@shared/services/configuration.service';
import { User } from '@store-front/users/interfaces/user.interfase';
import { UserService } from '@store-front/users/services/user.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'user-details',
  imports: [ReactiveFormsModule, FormErrorLabelComponent],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.css',
})
export class UserDetailsComponent {
  user = input.required<User>();

  router = inject(Router);
  userService = inject(UserService);
  configurationService = inject(ConfigurationService);

  fb = inject(FormBuilder);

  userForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    roles: [[''], Validators.required],
  });

  ngOnInit(): void {
    this.userForm.reset(this.user());
  }

  async onSubmit() {
    this.userForm.markAllAsTouched();
    const formValue = this.userForm.value;

    const userData: Partial<User> = {
      ...(formValue as any),
    };

    if (this.user().id === 'new') {
      await firstValueFrom(this.userService.create(userData));
    } else {
      await firstValueFrom(this.userService.update(this.user().id, userData));
    }
    this.router.navigate(['/admin/users']);
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
