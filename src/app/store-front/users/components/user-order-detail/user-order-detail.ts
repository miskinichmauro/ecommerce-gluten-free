import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AccountService } from '@store-front/users/services/account.service';
import { OrderDto, OrderItemDto } from '@store-front/users/interfaces/account.interfaces';
import { GuaraniesPipe } from '@shared/pipes/guaranies-pipe';
import { ProductImagePipe } from 'src/app/products/pipes/product-image.pipe';

@Component({
  selector: 'app-user-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, GuaraniesPipe, ProductImagePipe],
  templateUrl: './user-order-detail.html',
  styleUrl: './user-order-detail.css',
})
export class UserOrderDetail implements OnInit {
  private readonly accountService = inject(AccountService);
  private readonly route = inject(ActivatedRoute);

  order = signal<OrderDto | null>(null);
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
    const id = this.route.snapshot.params['id'];
    if (!id) return;
    this.loadOrder(id);
  }

  private loadOrder(id: string) {
    this.loading.set(true);
    this.accountService.getOrder(id).subscribe({
      next: (res) => this.order.set(res),
      error: () => this.order.set(null),
      complete: () => this.loading.set(false),
    });
  }

  statusLabel(status?: string): string {
    if (!status) return 'Pendiente';
    const key = status.toLowerCase();
    return this.statusMap[key] ?? status;
  }

  itemCount(items?: OrderItemDto[]): number {
    return items?.reduce((acc, item) => acc + (item.quantity ?? 0), 0) ?? 0;
  }

  itemSubtotal(item: OrderItemDto): number {
    const qty = item.quantity ?? 0;
    const price = item.unitPrice ?? item.price ?? 0;
    return qty * price;
  }
}
