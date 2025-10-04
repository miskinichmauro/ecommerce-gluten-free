import { Component, inject, signal, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ContactService } from 'src/app/contacts/services/contact.service';
import { Contact } from 'src/app/contacts/interfaces/contact.interface';
import { RouterLink } from '@angular/router';
import { LoadingComponent } from 'src/app/shared/components/loading/loading.component';
import { ContactsTableComponent } from 'src/app/contacts/components/contacts-table/contacts-table.component';

@Component({
  selector: 'contacts-admin',
  imports: [RouterLink, ContactsTableComponent, LoadingComponent],
  templateUrl: './contacts-admin.component.html',
  styleUrls: ['./contacts-admin.component.css'],
})
export class ContactsAdminComponent implements OnInit {
  private contactService = inject(ContactService);

  contacts = signal<Contact[] | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  async getContacts() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const data = await firstValueFrom(this.contactService.getContacts());
      this.contacts.set(data);
    } catch (err) {
      this.error.set('Error al cargar los contactos');
    } finally {
      this.loading.set(false);
    }
  }

  ngOnInit(): void {
    this.getContacts();
  }
}
