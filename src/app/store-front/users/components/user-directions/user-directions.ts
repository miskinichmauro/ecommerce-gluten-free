import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService } from '@store-front/users/services/account.service';
import { UserAddressDto } from '@store-front/users/interfaces/account.interfaces';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-directions',
  imports: [CommonModule, RouterLink],
  templateUrl: './user-directions.html',
  styleUrl: './user-directions.css',
})
export class UserDirections implements OnInit {
  private readonly accountService = inject(AccountService);

  addresses = signal<UserAddressDto[]>([]);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.accountService.getAddresses().subscribe({
      next: (res) => this.addresses.set(res ?? []),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }

  toggleDefault(address: UserAddressDto) {
    this.loading.set(true);
    const isDefault = !(address.isDefault ?? false);
    this.accountService.updateAddress(address.id, { isDefault }).subscribe({
      next: () => this.load(),
      error: () => this.loading.set(false),
    });
  }

  remove(address: UserAddressDto) {
    this.loading.set(true);
    this.accountService.deleteAddress(address.id).subscribe({
      next: () => this.load(),
      error: () => this.loading.set(false),
    });
  }
}
