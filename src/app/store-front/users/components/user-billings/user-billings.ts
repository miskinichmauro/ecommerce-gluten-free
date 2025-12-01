import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService } from '@store-front/users/services/account.service';
import { BillingProfileDto } from '@store-front/users/interfaces/account.interfaces';
import { RouterLink } from '@angular/router';
import { UserBillingsSkeleton } from '@store-front/users/components/user-billings-skeleton/user-billings-skeleton';

@Component({
  selector: 'app-user-billings',
  imports: [CommonModule, RouterLink, UserBillingsSkeleton],
  templateUrl: './user-billings.html',
  styleUrl: './user-billings.css',
})
export class UserBillings implements OnInit {
  private readonly accountService = inject(AccountService);

  profiles = signal<BillingProfileDto[]>([]);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.load();
  }

  load(force = false) {
    this.loading.set(true);
    this.accountService.getBillingProfiles({ force }).subscribe({
      next: (res) => this.profiles.set(res ?? []),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }

  toggleDefault(profile: BillingProfileDto) {
    this.loading.set(true);
    const isDefault = !(profile.isDefault ?? false);
    this.accountService.updateBilling(profile.id, { isDefault }).subscribe({
      next: () => this.load(true),
      error: () => this.loading.set(false),
    });
  }

  remove(profile: BillingProfileDto) {
    this.loading.set(true);
    this.accountService.deleteBilling(profile.id).subscribe({
      next: () => this.load(true),
      error: () => this.loading.set(false),
    });
  }
}
