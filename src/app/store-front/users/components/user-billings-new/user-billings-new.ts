import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '@store-front/users/services/account.service';
import { BillingProfileDto } from '@store-front/users/interfaces/account.interfaces';

@Component({
  selector: 'app-user-billings-new',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-billings-new.html',
  styleUrl: './user-billings-new.css',
})
export class UserBillingsNew implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly accountService = inject(AccountService);
  private readonly router = inject(Router);

  editingId: string | null = null;
  submitting = signal<boolean>(false);

  form = this.fb.nonNullable.group({
    legalName: ['', [Validators.required]],
    taxId: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    addressLine1: ['', [Validators.required]],
    city: ['', [Validators.required]],
    state: ['', [Validators.required]],
    country: ['Paraguay', [Validators.required]],
    isDefault: [false],
  });
  private initialValue = this.form.getRawValue();

  ngOnInit(): void {
    const url = new URL(window.location.href);
    const editId = url.searchParams.get('edit');
    if (editId) {
      this.editingId = editId;
      this.prefill(editId);
    }
  }

  prefill(id: string) {
    this.submitting.set(true);
    this.accountService.getBillingProfiles().subscribe({
      next: (res) => {
        const match = (res ?? []).find((b) => b.id === id);
        if (match) {
          this.form.patchValue(match as Partial<BillingProfileDto>);
          this.updateInitialValue();
        }
      },
      complete: () => this.submitting.set(false),
      error: () => this.submitting.set(false),
    });
  }

  save() {
    if (this.form.invalid) return;
    this.submitting.set(true);
    const data = this.form.getRawValue();
    const req$ = this.editingId
      ? this.accountService.updateBilling(this.editingId, data)
      : this.accountService.createBilling(data);

    req$.subscribe({
      next: () => {
        this.updateInitialValue();
        this.submitting.set(false);
        this.router.navigate(['/user/billing']);
      },
      error: () => this.submitting.set(false),
    });
  }

  hasChanges() {
    return !this.isEqual(this.form.getRawValue(), this.initialValue);
  }

  private updateInitialValue() {
    this.initialValue = this.form.getRawValue();
    this.form.markAsPristine();
  }

  private isEqual<T extends Record<string, unknown>>(a: T, b: T) {
    const keys = Object.keys(a) as (keyof T)[];
    return keys.length === Object.keys(b).length && keys.every((k) => a[k] === b[k]);
  }

  isInvalid(controlName: keyof typeof this.form.controls) {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}
