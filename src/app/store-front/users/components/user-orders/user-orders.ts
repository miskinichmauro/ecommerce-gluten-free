import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AccountService } from '@store-front/users/services/account.service';
import { OrderDto } from '@store-front/users/interfaces/account.interfaces';
import { GuaraniesPipe } from '@shared/pipes/guaranies-pipe';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { PaginationService } from '@shared/components/pagination/pagination.service';
import { UserOrdersSkeleton } from '@store-front/users/components/user-orders-skeleton/user-orders-skeleton';

@Component({
  selector: 'app-user-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, GuaraniesPipe, PaginationComponent, UserOrdersSkeleton],
  templateUrl: './user-orders.html',
  styleUrl: './user-orders.css',
})
export class UserOrders {
  private readonly accountService = inject(AccountService);
  readonly paginationService = inject(PaginationService);

  orders = signal<OrderDto[]>([]);
  loading = signal<boolean>(true);
  hasMore = signal<boolean>(false);
  private readonly pageSize = 4;
  readonly statusMap: Record<string, string> = {
    pending: 'Pendiente',
    paid: 'Pagado',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
    refunded: 'Reembolsado',
  };
  readonly totalPages = computed(() => {
    const current = this.paginationService.currentPage();
    return Math.max(current, current + (this.hasMore() ? 1 : 0));
  });

  constructor() {
    effect(() => {
      const page = this.paginationService.currentPage();
      this.loadOrders(false, page);
    });
  }

  loadOrders(force = false, page = this.paginationService.currentPage()) {
    this.loading.set(true);
    const offset = Math.max(0, page - 1) * this.pageSize;
    this.accountService
      .getOrders(this.pageSize, offset, { force })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          this.orders.set(res.items);
          this.hasMore.set(res.items.length === this.pageSize);
        },
        error: () => {
          this.orders.set([]);
          this.hasMore.set(false);
        },
      });
  }

  statusLabel(status?: string): string {
    if (!status) return 'Pendiente';
    const key = status.toLowerCase();
    return this.statusMap[key] ?? status;
  }
}
