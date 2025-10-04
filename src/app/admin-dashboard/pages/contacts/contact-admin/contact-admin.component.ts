import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingComponent } from 'src/app/shared/components/loading/loading.component';
import { Contact } from 'src/app/contacts/interfaces/contact.interface';
import { ContactService } from 'src/app/contacts/services/contact.service';
import { ContactDetailsComponent } from './contact-details/contact-details.component';
import { firstValueFrom, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'contact-admin',
  imports: [LoadingComponent, ContactDetailsComponent],
  templateUrl: './contact-admin.component.html',
  styleUrls: ['./contact-admin.component.css'],
})
export class ContactAdminComponent {
  private activateRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private contactService = inject(ContactService);

  contactId = toSignal(
    this.activateRoute.params.pipe(
      map(params => params['id'])
    )
  );

  contact = signal<Contact | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  constructor() {
    effect(() => {
      const id = this.contactId();
      this.loadContact(id);
    });
  }

  private async loadContact(id: string) {
    this.loading.set(true);
    this.error.set(null);

    try {
      const contact = await firstValueFrom(this.contactService.getContactById(id));
      this.contact.set(contact);
    } catch (err) {
      this.error.set('Error al cargar el contacto');
      this.router.navigate(['/admin/contacts']);
    } finally {
      this.loading.set(false);
    }
  }
}
