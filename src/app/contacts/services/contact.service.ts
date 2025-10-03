import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Contact } from '../interfaces/contact.interface';

const baseUrlContact = `${environment.baseUrl}/contacts`;

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);
  private readonly contactsCache = new Map<string, Contact>();

  getContacts(): Observable<Contact[]> {
    if (this.contactsCache.size) {
      return of(Array.from(this.contactsCache.values()));
    }

    return this.http.get<Contact[]>(baseUrlContact).pipe(
      tap((resp) => resp.forEach((contact) => this.contactsCache.set(contact.id, contact))),
    );
  }

  getContactById(id: string): Observable<Contact> {
    if (this.contactsCache.has(id)) {
      return of(this.contactsCache.get(id)!);
    }

    return this.http.get<Contact>(`${baseUrlContact}/${id}`).pipe(
      tap((resp) => this.contactsCache.set(id, resp))
    );
  }

  updateContact(id: string, partialContact: Partial<Contact>): Observable<Contact> {
    return this.http.patch<Contact>(`${baseUrlContact}/${id}`, partialContact).pipe(
      tap((resp) => this.contactsCache.set(resp.id, resp))
    );
  }
}
