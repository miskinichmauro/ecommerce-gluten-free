import { Component, Input, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { SuccessComponent } from "../success/success.component";
import { LoadingComponent } from "../loading/loading.component";
import { ToastService } from '@shared/services/toast.service';

@Component({
  selector: 'toast',
  imports: [CommonModule, SuccessComponent, LoadingComponent, NgClass],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
})
export class ToastComponent implements OnInit, OnDestroy {
  private readonly toastService = inject(ToastService);

  loading = this.toastService.loading;
  success = this.toastService.success;

  @Input() positionClass = 'bottom-4 right-4';
  @Input() overFooterClass = 'bottom-24 right-6';

  footerVisible = signal(false);
  private footerObserver: IntersectionObserver | null = null;

  ngOnInit(): void {
    const footer = document.querySelector('app-footer');
    if (!footer) return;
    this.footerObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        this.footerVisible.set(visible);
      },
      { threshold: 0.1 }
    );
    this.footerObserver.observe(footer);
  }

  ngOnDestroy(): void {
    this.footerObserver?.disconnect();
  }
}
