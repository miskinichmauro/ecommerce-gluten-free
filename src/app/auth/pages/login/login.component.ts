import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from '../../auth.service';
import { ConfigurationService } from 'src/app/shared/services/configuration.service';
import { LoadingComponent } from "src/app/shared/components/loading/loading.component";
import { SuccessComponent } from "src/app/shared/components/success/success.component";

@Component({
  selector: 'login',
  imports: [ReactiveFormsModule, LoadingComponent, SuccessComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  authService = inject(AuthService);
  configurationService = inject(ConfigurationService);
  fb = inject(FormBuilder);
  router = inject(Router);
  loading = signal(false);
  hasError = signal(false);
  success = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  })

  openRegister() {
    this.configurationService.openSidebar('register');
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.hasError.set(true);
      setTimeout(() => {
        this.hasError.set(false);
      }, 2000);
    }

    const { email = '', password = ''} = this.loginForm.value;

    this.loading.set(true);
    this.authService.login(email!, password!)
      .subscribe(async isAuthenticated => {

        await this.isSuccess();

        if (isAuthenticated) {
          this.router.navigateByUrl('/');
          return;
        }

        this.hasError.set(true);
        setTimeout(() => {
          this.hasError.set(false);
        }, 2000);
    });
  }

  async isSuccess() {
    this.loading.set(false);
    this.success.set(true);

    await new Promise(res => setTimeout(res, 800));

    this.configurationService.toggleSidebarPageStatus('closed');
    this.configurationService.toggleSidebarItemsStatus('closed');
  }
}
