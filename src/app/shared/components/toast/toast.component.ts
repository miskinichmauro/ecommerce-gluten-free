import { Component, Input, inject } from '@angular/core';
import { SuccessComponent } from "../success/success.component";
import { LoadingComponent } from "../loading/loading.component";
import { ToastService } from '@shared/services/toast.service';

@Component({
  selector: 'toast',
  imports: [SuccessComponent, LoadingComponent],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
})
export class ToastComponent {
  private readonly toastService = inject(ToastService);

  loading = this.toastService.loading;
  success = this.toastService.success;

  @Input() positionClass = 'bottom-4 right-4';
}
