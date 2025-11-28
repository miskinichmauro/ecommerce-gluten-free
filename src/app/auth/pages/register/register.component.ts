import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { ConfigurationService } from 'src/app/shared/services/configuration.service';
import { LoadingComponent } from 'src/app/shared/components/loading/loading.component';
import { SuccessComponent } from 'src/app/shared/components/success/success.component';
import { HttpErrorResponse } from '@angular/common/http';
import { PasswordToggleComponent } from 'src/app/shared/components/password-toggle/password-toggle.component';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, LoadingComponent, SuccessComponent, PasswordToggleComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  fb = inject(FormBuilder);
  hasError = signal<string | null>(null);
  loading = signal(false);
  success = signal(false);
  router = inject(Router);

  authService = inject(AuthService);
  configurationService = inject(ConfigurationService);
  passwordVisible = signal(false);
  confirmPasswordVisible = signal(false);

  private readonly passwordsMatchValidator: ValidatorFn = (form: AbstractControl): ValidationErrors | null => {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  };

  private readonly passwordStrengthValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.value as string;

    if (!password) return null;

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    return hasUppercase && hasLowercase && hasNumber ? null : { weakPassword: true };
  };

  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6), this.passwordStrengthValidator]],
    confirmPassword: ['', [Validators.required]],
    fullName: ['', [Validators.required, Validators.minLength(1)]]
  }, { validators: this.passwordsMatchValidator });

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.hasError.set('Completa los campos requeridos');
      setTimeout(() => this.hasError.set(null), 2000);
      return;
    }

    const { email = '', password = '', fullName = '' } = this.registerForm.value;
    this.loading.set(true);

    this.authService.register(email!, password!, fullName!)
      .subscribe({
        next: async (isAuthenticated) => {
          if (isAuthenticated) {
            await this.showSuccess();
            this.router.navigateByUrl('/');
            return;
          }

          this.loading.set(false);
          this.setError('No se pudo crear la cuenta');
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          const message = err?.error?.expose ? err.error?.message : 'No se pudo crear la cuenta';
          this.setError(message);
        }
      });
  }

  private async showSuccess() {
    this.loading.set(false);
    this.success.set(true);

    await new Promise(res => setTimeout(res, 800));

    this.configurationService.toggleSidebarPageStatus('closed');
    this.configurationService.toggleSidebarItemsStatus('closed');
  }

  private setError(message: string) {
    this.hasError.set(message);
    setTimeout(() => this.hasError.set(null), 4000);
  }

  togglePasswordVisibility() {
    this.passwordVisible.update((v) => !v);
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible.update((v) => !v);
  }

  goBack() {
    if (this.configurationService.sidebarPageStatus() === 'open') {
      this.configurationService.openSidebar('auth');
    } else {
      this.router.navigate(['/auth/login']);
    }
  }
}
