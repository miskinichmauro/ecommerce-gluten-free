import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ToastService } from '@shared/services/toast.service';
import { finalize, Observable, of, shareReplay, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BillingProfileDto, OrderDto, UserAddressDto, UserProfileDto } from '../interfaces/account.interfaces';

const accountBase = `${environment.baseUrl}/account`;
const ordersBase = `${environment.baseUrl}/orders`;
const cartBase = `${environment.baseUrl}/cart`;

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
  private readonly ordersCache = new Map<string, OrderDto[]>();
  private readonly ordersRequest = new Map<string, Observable<OrderDto[]>>();
  private addressesCache: UserAddressDto[] | null = null;
  private addressesRequest$: Observable<UserAddressDto[]> | null = null;
  private billingsCache: BillingProfileDto[] | null = null;
  private billingsRequest$: Observable<BillingProfileDto[]> | null = null;

  private cacheKey(limit: number, offset: number): string {
    return `${limit}:${offset}`;
  }

  private clearOrdersCache(): void {
    this.ordersCache.clear();
    this.ordersRequest.clear();
  }

  private clearAddressesCache(): void {
    this.addressesCache = null;
    this.addressesRequest$ = null;
  }

  private clearBillingsCache(): void {
    this.billingsCache = null;
    this.billingsRequest$ = null;
  }

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

  getAddresses(options?: { force?: boolean }): Observable<UserAddressDto[]> {
    if (options?.force) {
      this.clearAddressesCache();
    }

    if (this.addressesCache) {
      return of(this.addressesCache);
    }

    if (!this.addressesRequest$) {
      this.addressesRequest$ = this.http.get<UserAddressDto[]>(`${accountBase}/addresses`).pipe(
        tap(res => (this.addressesCache = res ?? [])),
        shareReplay({ bufferSize: 1, refCount: true }),
        finalize(() => (this.addressesRequest$ = null))
      );
    }
    return this.addressesRequest$;
  }

  createAddress(data: Partial<UserAddressDto>): Observable<UserAddressDto> {
    this.toast.activateLoading();
    return this.http.post<UserAddressDto>(`${accountBase}/addresses`, data).pipe(
      tap(() => {
        this.toast.activateSuccess();
        this.clearAddressesCache();
      }),
      finalize(() => this.toast.deactivateLoading())
    );
  }

  updateAddress(id: string, data: Partial<UserAddressDto>): Observable<UserAddressDto> {
    this.toast.activateLoading();
    return this.http.patch<UserAddressDto>(`${accountBase}/addresses/${id}`, data).pipe(
      tap(() => {
        this.toast.activateSuccess();
        this.clearAddressesCache();
      }),
      finalize(() => this.toast.deactivateLoading())
    );
  }

  deleteAddress(id: string): Observable<void> {
    this.toast.activateLoading();
    return this.http.delete<void>(`${accountBase}/addresses/${id}`).pipe(
      tap(() => {
        this.toast.activateSuccess();
        this.clearAddressesCache();
      }),
      finalize(() => this.toast.deactivateLoading())
    );
  }

  getBillingProfiles(options?: { force?: boolean }): Observable<BillingProfileDto[]> {
    if (options?.force) {
      this.clearBillingsCache();
    }

    if (this.billingsCache) {
      return of(this.billingsCache);
    }

    if (!this.billingsRequest$) {
      this.billingsRequest$ = this.http.get<BillingProfileDto[]>(`${accountBase}/billing`).pipe(
        tap(res => (this.billingsCache = res ?? [])),
        shareReplay({ bufferSize: 1, refCount: true }),
        finalize(() => (this.billingsRequest$ = null))
      );
    }
    return this.billingsRequest$;
  }

  createBilling(data: Partial<BillingProfileDto>): Observable<BillingProfileDto> {
    this.toast.activateLoading();
    return this.http.post<BillingProfileDto>(`${accountBase}/billing`, data).pipe(
      tap(() => {
        this.toast.activateSuccess();
        this.clearBillingsCache();
      }),
      finalize(() => this.toast.deactivateLoading())
    );
  }

  updateBilling(id: string, data: Partial<BillingProfileDto>): Observable<BillingProfileDto> {
    this.toast.activateLoading();
    return this.http.patch<BillingProfileDto>(`${accountBase}/billing/${id}`, data).pipe(
      tap(() => {
        this.toast.activateSuccess();
        this.clearBillingsCache();
      }),
      finalize(() => this.toast.deactivateLoading())
    );
  }

  deleteBilling(id: string): Observable<void> {
    this.toast.activateLoading();
    return this.http.delete<void>(`${accountBase}/billing/${id}`).pipe(
      tap(() => {
        this.toast.activateSuccess();
        this.clearBillingsCache();
      }),
      finalize(() => this.toast.deactivateLoading())
    );
  }

  getOrders(limit = 10, offset = 0, options?: { force?: boolean }): Observable<OrderDto[]> {
    const key = this.cacheKey(limit, offset);
    if (options?.force) {
      this.ordersCache.delete(key);
    }

    const cached = this.ordersCache.get(key);
    if (cached) {
      return of(cached);
    }

    let request$ = this.ordersRequest.get(key);
    if (!request$) {
      request$ = this.http.get<OrderDto[]>(`${ordersBase}?limit=${limit}&offset=${offset}`).pipe(
        tap(res => this.ordersCache.set(key, res ?? [])),
        shareReplay({ bufferSize: 1, refCount: true }),
        finalize(() => this.ordersRequest.delete(key))
      );
      this.ordersRequest.set(key, request$);
    }
    return request$;
  }

  getOrder(id: string): Observable<OrderDto> {
    return this.http.get<OrderDto>(`${ordersBase}/${id}`);
  }

  checkoutOrder(payload: CheckoutPayload): Observable<CheckoutResponse> {
    this.toast.activateLoading();
    return this.http.post<CheckoutResponse>(`${ordersBase}/checkout`, payload).pipe(
      tap(() => {
        this.toast.activateSuccess();
        this.clearOrdersCache();
      }),
      finalize(() => this.toast.deactivateLoading())
    );
  }

  clearCart() {
    localStorage.removeItem('guestCart');
    return this.http.delete<void>(cartBase).pipe(finalize(() => {})).subscribe({ complete: () => {} });
  }
}
