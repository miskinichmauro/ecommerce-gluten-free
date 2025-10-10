import { Component, inject, signal, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ContactService } from 'src/app/contacts/services/contact.service';
import { LoadingComponent } from "src/app/shared/components/loading/loading.component";
import { ContactCardComponent } from "src/app/contacts/components/contact-card/contact-card.component";
import { Contact } from 'src/app/contacts/interfaces/contact.interface';

@Component({
  selector: 'app-contact',
  imports: [LoadingComponent, ContactCardComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent implements OnInit {
  contactService = inject(ContactService);

  contacts = signal<Contact[] | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  async getContacts(){
    this.loading.set(true);
    this.error.set(null);

    try {
      const data = await firstValueFrom(
        this.contactService.getAll()
      );
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

  rowsFormatted(): Contact[][] {
    const list = this.contacts() || [];
    const rows: Contact[][] = [];

    for (let i = 0; i < list.length;) {
      if ((list.length - i) % 2 === 1) {
        rows.push([list[i]]);
        i += 1;
      } else {
        rows.push(list.slice(i, i + 2));
        i += 2;
      }
    }

    return rows;
  }
}
