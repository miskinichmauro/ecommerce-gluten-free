import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { finalize, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Contact } from '../interfaces/contact.interface';
import { ToastService } from '@shared/services/toast.service';

const baseUrlContacts = `${environment.baseUrl}/contacts`;

const emptyContact: Contact = {
  id: 'new',
  title: '',
  phone: '',
  email: ''
};

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);
  private readonly contactsCache = new Map<string, Contact>();
  private readonly toastService = inject(ToastService);

  getAll(): Observable<Contact[]> {
    if (this.contactsCache.size) {
      return of(Array.from(this.contactsCache.values()));
    }

    return this.http.get<Contact[]>(baseUrlContacts).pipe(
      tap((res) => res.forEach((contact) => this.contactsCache.set(contact.id, contact)))
    );
  }

  getById(id: string): Observable<Contact> {
    if (id === 'new') {
      return of(emptyContact);
    }

    if (this.contactsCache.has(id)) {
      return of(this.contactsCache.get(id)!);
    }

    return this.http.get<Contact>(`${baseUrlContacts}/${id}`).pipe(
      tap((res) => this.contactsCache.set(id, res))
    );
  }

  create(contact: Partial<Contact>): Observable<Contact> {
    this.toastService.activateLoading();
    return this.http.post<Contact>(baseUrlContacts, contact).pipe(
      tap((res) => {
        this.insertOrUpdateCache(res);
        this.toastService.activateSuccess();
      }),
      finalize(() => this.toastService.deactivateLoading())
    );
  }

  update(id: string, partialContact: Partial<Contact>): Observable<Contact> {
    this.toastService.activateLoading();
    return this.http.patch<Contact>(`${baseUrlContacts}/${id}`, partialContact).pipe(
      tap(async(res) => {
        this.insertOrUpdateCache(res);;
        this.toastService.activateSuccess();
      }),
      finalize(() => this.toastService.deactivateLoading())
    );
  }

  delete(id: string): Observable<Contact> {
    this.toastService.activateLoading();
    return this.http.delete<Contact>(`${baseUrlContacts}/${id}`).pipe(
      tap(async () => {
        this.contactsCache.delete(id);;
        this.toastService.activateSuccess();
      }),
      finalize(() => this.toastService.deactivateLoading())
    );
  }

  private insertOrUpdateCache(contact: Contact) {
    this.contactsCache.set(contact.id, contact);
  }
}
