import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from '../../auth.service';
import { ConfigurationService } from 'src/app/shared/services/configuration.service';
import { LoadingComponent } from "src/app/shared/components/loading/loading.component";
import { SuccessComponent } from "src/app/shared/components/success/success.component";
import { HttpErrorResponse } from '@angular/common/http';
import { PasswordToggleComponent } from 'src/app/shared/components/password-toggle/password-toggle.component';

@Component({
  selector: 'login',
  imports: [ReactiveFormsModule, LoadingComponent, SuccessComponent, PasswordToggleComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  authService = inject(AuthService);
  configurationService = inject(ConfigurationService);
  fb = inject(FormBuilder);
  router = inject(Router);
  loading = signal(false);
  hasError = signal<string | null>(null);
  success = signal(false);
  passwordVisible = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  })

  openRegister() {
    this.configurationService.openSidebar('register');
  }

  togglePasswordVisibility() {
    this.passwordVisible.update((v) => !v);
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.hasError.set('Completa los campos requeridos');
      setTimeout(() => this.hasError.set(null), 2000);
      return;
    }

    const { email = '', password = ''} = this.loginForm.value;

    this.loading.set(true);
    this.authService.login(email!, password!)
      .subscribe({
        next: async (isAuthenticated) => {
          if (isAuthenticated) {
            await this.isSuccess();
            return;
          }
          this.loading.set(false);
          this.setErrorMessage('No se pudo iniciar sesion');
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          const message = err?.error?.expose ? err.error?.message : 'Las credenciales no son validas';
          this.setErrorMessage(message);
        }
      });
  }

  async isSuccess() {
    this.loading.set(false);
    this.success.set(true);

    await new Promise(res => setTimeout(res, 800));

    this.configurationService.toggleSidebarPageStatus('closed');
    this.configurationService.toggleSidebarItemsStatus('closed');
  }

  private setErrorMessage(message: string) {
    this.hasError.set(message);
    setTimeout(() => this.hasError.set(null), 4000);
  }
}
