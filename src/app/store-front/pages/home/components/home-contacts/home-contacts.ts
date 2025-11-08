import { Component, inject, signal, OnInit } from '@angular/core';
import { ContactService } from 'src/app/contacts/services/contact.service';
import { ContactCardComponent } from 'src/app/contacts/components/contact-card/contact-card.component';
import { LoadingComponent } from 'src/app/shared/components/loading/loading.component';

@Component({
  selector: 'home-contacts',
  standalone: true,
  imports: [ContactCardComponent, LoadingComponent],
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
