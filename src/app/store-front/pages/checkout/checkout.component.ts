import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService, CheckoutResponse } from '@store-front/users/services/account.service';
import { BillingProfileDto, UserAddressDto } from '@store-front/users/interfaces/account.interfaces';

type PaymentMethod = 'cod' | 'online';
type CodOption = 'cash' | 'card';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly accountService = inject(AccountService);

  readonly steps = [
    { id: 1, label: 'Entrega' },
    { id: 2, label: 'Facturacion' },
    { id: 3, label: 'Pago' },
    { id: 4, label: 'Confirmar' },
  ];

  currentStep = signal(1);

  shippingAddresses = signal<UserAddressDto[]>([]);
  billingOptions = signal<BillingProfileDto[]>([]);
  selectedShippingId = signal<string | null>(null);
  selectedBillingId = signal<string | null>(null);

  paymentMethod = signal<PaymentMethod>('cod');
  codOption = signal<CodOption>('cash');

  orderResponse = signal<CheckoutResponse | null>(null);
  submitting = signal<boolean>(false);

  ngOnInit(): void {
    this.loadShippingAddresses();
    this.loadBillingProfiles();
  }

  selectStep(step: number) {
    if (this.orderResponse() && this.currentStep() === 4 && step < 4) return;
    if (step === 4 && !this.orderResponse()) return;
    this.currentStep.set(step);
  }

  nextStep() {
    const step = this.currentStep();
    if (this.orderResponse() && step === 4) return;
    if (step === 3) {
      this.submitCheckout();
      return;
    }
    this.currentStep.update((value) => Math.min(value + 1, this.steps.length));
  }

  prevStep() {
    if (this.orderResponse() && this.currentStep() === 4) return;
    this.currentStep.update((step) => Math.max(step - 1, 1));
  }

  chooseBilling(id: string) {
    this.selectedBillingId.set(id);
  }

  selectPayment(method: PaymentMethod) {
    this.paymentMethod.set(method);
  }

  selectCod(option: CodOption) {
    this.codOption.set(option);
  }

  goToOrders() {
    this.router.navigateByUrl('/user/orders');
  }

  goToProducts() {
    this.router.navigateByUrl('/products');
  }

  goToBillingData() {
    this.router.navigateByUrl('/user/billing');
  }

  goToShippingData() {
    this.router.navigateByUrl('/user/directions');
  }

  private loadShippingAddresses() {
    this.accountService.getAddresses().subscribe({
      next: (addresses) => {
        this.shippingAddresses.set(addresses ?? []);
        const defaultAddress = addresses?.find((a) => a.isDefault) ?? addresses?.[0];
        this.selectedShippingId.set(defaultAddress?.id ?? null);
      },
    });
  }

  private loadBillingProfiles() {
    this.accountService.getBillingProfiles().subscribe({
      next: (profiles) => {
        this.billingOptions.set(profiles ?? []);
        const defaultBilling = profiles?.find((b) => b.isDefault) ?? profiles?.[0];
        this.selectedBillingId.set(defaultBilling?.id ?? null);
      },
    });
  }

  private submitCheckout() {
    if (this.submitting()) return;
    const shippingAddressId = this.selectedShippingId();
    if (!shippingAddressId) {
      alert('Selecciona una direccion de entrega');
      return;
    }

    const payload = {
      shippingAddressId,
      billingProfileId: this.selectedBillingId() ?? undefined,
    };

    this.submitting.set(true);
    this.accountService.checkoutOrder(payload).subscribe({
      next: (res) => {
        this.orderResponse.set(res);
        this.currentStep.set(4);
      },
      error: () => {},
      complete: () => this.submitting.set(false),
    });
  }

  orderNumber(): string {
    const res = this.orderResponse();
    return res?.orderNumber ?? res?.id ?? '';
  }
}
