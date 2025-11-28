import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  loading = signal<boolean>(false);
  success = signal<boolean>(false);
  error = signal<string | null>(null);
  private errorTimeout: ReturnType<typeof setTimeout> | null = null;

  activateLoading() {
    this.clearError();
    this.loading.set(true);
    this.success.set(false);
  }

  deactivateLoading() {
    this.loading.set(false);
  }

  activateSuccess() {
    this.loading.set(false);
    this.success.set(true);
    this.clearError();

    setTimeout(() => this.success.set(false), 800);
  }

  activateError(message: string) {
    this.loading.set(false);
    this.success.set(false);
    this.error.set(message);

    if (this.errorTimeout) clearTimeout(this.errorTimeout);
    this.errorTimeout = setTimeout(() => this.error.set(null), 4000);
  }

  private clearError() {
    this.error.set(null);
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
      this.errorTimeout = null;
    }
  }
}
