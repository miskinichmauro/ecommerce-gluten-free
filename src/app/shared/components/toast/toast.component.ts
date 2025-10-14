import { Component, inject, signal } from '@angular/core';
import { SuccessComponent } from "../success/success.component";
import { LoadingComponent } from "../loading/loading.component";
import { ConfigurationService } from '../../services/configuration.service';

@Component({
  selector: 'toast',
  imports: [SuccessComponent, LoadingComponent],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
})
export class ToastComponent {
  configurationService = inject(ConfigurationService);

  loading = this.configurationService.loading;
  success = this.configurationService.success;
}
