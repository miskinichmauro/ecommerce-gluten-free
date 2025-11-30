import { Component, inject, signal, OnInit } from '@angular/core';
import { ContactService } from 'src/app/contacts/services/contact.service';
import { ContactCardComponent } from 'src/app/contacts/components/contact-card/contact-card.component';
import { ContactSkeleton } from "@contacts/components/contact-skeleton/contact-skeleton";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'home-contacts',
  standalone: true,
  imports: [ContactCardComponent, ContactSkeleton, RouterLink],
  templateUrl: './home-contacts.html',
  styleUrl: './home-contacts.css',
})
export class HomeContacts implements OnInit {

  private contactService = inject(ContactService);
  contacts = signal<any[]>([]);
  loading = signal(true);

  async ngOnInit() {
    try {
      const res = await this.contactService.getAll().toPromise();
      this.contacts.set((res ?? []).slice(0, 2));
    } finally {
      this.loading.set(false);
    }
  }
}
