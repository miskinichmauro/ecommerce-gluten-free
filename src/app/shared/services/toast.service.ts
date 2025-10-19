import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  loading = signal<boolean>(false);
  success = signal<boolean>(false);

  activateLoading() {
    this.loading.set(true);
    this.success.set(false);
  }

  deactivateLoading() {
    this.loading.set(false);
  }

  activateSuccess() {
    this.loading.set(false);
    this.success.set(true);
    
    setTimeout(() => this.success.set(false), 800);
  }
}
