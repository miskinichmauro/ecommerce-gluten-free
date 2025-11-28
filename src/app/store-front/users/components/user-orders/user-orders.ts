import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AccountService } from '@store-front/users/services/account.service';
import { OrderDto } from '@store-front/users/interfaces/account.interfaces';
import { GuaraniesPipe } from '@shared/pipes/guaranies-pipe';

@Component({
  selector: 'app-user-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, GuaraniesPipe],
  templateUrl: './user-orders.html',
  styleUrl: './user-orders.css',
})
export class UserOrders implements OnInit {
  private readonly accountService = inject(AccountService);

  orders = signal<OrderDto[]>([]);
  loading = signal<boolean>(true);
  readonly statusMap: Record<string, string> = {
    pending: 'Pendiente',
    paid: 'Pagado',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
    refunded: 'Reembolsado',
  };

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders() {
    this.loading.set(true);
    this.accountService.getOrders(20, 0).subscribe({
      next: (res) => this.orders.set(res ?? []),
      error: () => this.orders.set([]),
      complete: () => this.loading.set(false),
    });
  }

  statusLabel(status?: string): string {
    if (!status) return 'Pendiente';
    const key = status.toLowerCase();
    return this.statusMap[key] ?? status;
  }
}
