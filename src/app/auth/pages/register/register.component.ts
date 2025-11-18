import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { ConfigurationService } from 'src/app/shared/services/configuration.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  fb = inject(FormBuilder);
  error = signal<string | null>(null);
  isPosting = signal(false);
  router = inject(Router);

  authService = inject(AuthService);
  configurationService = inject(ConfigurationService);

  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    fullName: ['', [Validators.required, Validators.minLength(1)]]
  }, { validators: this.passwordsMatchValidator });

  private passwordsMatchValidator(form: any) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    const { email = '', password = '', fullName = '' } = this.registerForm.value;
    const response = this.authService.register(email!, password!, fullName!)
      .subscribe(isAuthenticated => {
        if (isAuthenticated) {
          this.router.navigateByUrl('/');
          return;
        }

        this.error.set('No se pudo crear la cuenta');
        setTimeout(() => {
          this.error.set(null);
        }, 5000);
    });
  }

  goBack() {
    if (this.configurationService.sidebarPageStatus() === 'open') {
      this.configurationService.openSidebar('auth');
    } else {
      this.router.navigate(['/auth/login']);
    }
  }
}
