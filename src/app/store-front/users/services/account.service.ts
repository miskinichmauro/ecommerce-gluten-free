import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ToastService } from '@shared/services/toast.service';
import { finalize, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BillingProfileDto, OrderDto, UserAddressDto, UserProfileDto } from '../interfaces/account.interfaces';

const accountBase = `${environment.baseUrl}/account`;
const ordersBase = `${environment.baseUrl}/orders`;

interface CheckoutPayload {
  shippingAddressId: string;
  billingProfileId?: string;
  notes?: string;
}

export interface CheckoutResponse {
  id: string;
  orderNumber?: string;
}

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);

  getProfile(): Observable<UserProfileDto> {
    return this.http.get<UserProfileDto>(`${accountBase}/profile`);
  }

  updateProfile(data: Partial<UserProfileDto>): Observable<UserProfileDto> {
    this.toast.activateLoading();
    return this.http.patch<UserProfileDto>(`${accountBase}/profile`, data).pipe(
      tap(() => this.toast.activateSuccess()),
      finalize(() => this.toast.deactivateLoading())
    );
  }

  getAddresses(): Observable<UserAddressDto[]> {
    return this.http.get<UserAddressDto[]>(`${accountBase}/addresses`);
  }

  createAddress(data: Partial<UserAddressDto>): Observable<UserAddressDto> {
    this.toast.activateLoading();
    return this.http.post<UserAddressDto>(`${accountBase}/addresses`, data).pipe(
      tap(() => this.toast.activateSuccess()),
      finalize(() => this.toast.deactivateLoading())
    );
  }

  updateAddress(id: string, data: Partial<UserAddressDto>): Observable<UserAddressDto> {
    this.toast.activateLoading();
    return this.http.patch<UserAddressDto>(`${accountBase}/addresses/${id}`, data).pipe(
      tap(() => this.toast.activateSuccess()),
      finalize(() => this.toast.deactivateLoading())
    );
  }

  deleteAddress(id: string): Observable<void> {
    this.toast.activateLoading();
    return this.http.delete<void>(`${accountBase}/addresses/${id}`).pipe(
      tap(() => this.toast.activateSuccess()),
      finalize(() => this.toast.deactivateLoading())
    );
  }

  getBillingProfiles(): Observable<BillingProfileDto[]> {
    return this.http.get<BillingProfileDto[]>(`${accountBase}/billing`);
  }

  createBilling(data: Partial<BillingProfileDto>): Observable<BillingProfileDto> {
    this.toast.activateLoading();
    return this.http.post<BillingProfileDto>(`${accountBase}/billing`, data).pipe(
      tap(() => this.toast.activateSuccess()),
      finalize(() => this.toast.deactivateLoading())
    );
  }

  updateBilling(id: string, data: Partial<BillingProfileDto>): Observable<BillingProfileDto> {
    this.toast.activateLoading();
    return this.http.patch<BillingProfileDto>(`${accountBase}/billing/${id}`, data).pipe(
      tap(() => this.toast.activateSuccess()),
      finalize(() => this.toast.deactivateLoading())
    );
  }

  deleteBilling(id: string): Observable<void> {
    this.toast.activateLoading();
    return this.http.delete<void>(`${accountBase}/billing/${id}`).pipe(
      tap(() => this.toast.activateSuccess()),
      finalize(() => this.toast.deactivateLoading())
    );
  }

  getOrders(limit = 10, offset = 0): Observable<OrderDto[]> {
    return this.http.get<OrderDto[]>(`${ordersBase}?limit=${limit}&offset=${offset}`);
  }

  getOrder(id: string): Observable<OrderDto> {
    return this.http.get<OrderDto>(`${ordersBase}/${id}`);
  }

  checkoutOrder(payload: CheckoutPayload): Observable<CheckoutResponse> {
    this.toast.activateLoading();
    return this.http.post<CheckoutResponse>(`${ordersBase}/checkout`, payload).pipe(
      tap(() => this.toast.activateSuccess()),
      finalize(() => this.toast.deactivateLoading())
    );
  }
}
