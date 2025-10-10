import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Contact } from '../interfaces/contact.interface';

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

  getAll(): Observable<Contact[]> {
    if (this.contactsCache.size) {
      return of(Array.from(this.contactsCache.values()));
    }

    return this.http.get<Contact[]>(baseUrlContacts).pipe(
      tap((resp) => resp.forEach((contact) => this.contactsCache.set(contact.id, contact)))
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
      tap((resp) => this.contactsCache.set(id, resp))
    );
  }

  create(contact: Partial<Contact>): Observable<Contact> {
    return this.http.post<Contact>(baseUrlContacts, contact).pipe(
      tap((res) => this.insertOrUpdateCache(res))
    );
  }

  update(id: string, partialContact: Partial<Contact>): Observable<Contact> {
    return this.http.patch<Contact>(`${baseUrlContacts}/${id}`, partialContact).pipe(
      tap((resp) => this.insertOrUpdateCache(resp))
    );
  }

  delete(id: string): Observable<Contact> {
    return this.http.delete<Contact>(`${baseUrlContacts}/${id}`).pipe(
      tap(() => this.contactsCache.delete(id))
    );
  }

  private insertOrUpdateCache(contact: Contact) {
    this.contactsCache.set(contact.id, contact);
  }
}
