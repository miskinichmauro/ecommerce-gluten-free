import { Component, input } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Contact } from '../../interfaces/contact.interface';

@Component({
  selector: 'contacts-table',
  imports: [RouterLink],
  templateUrl: './contacts-table.component.html',
  styleUrls: ['./contacts-table.component.css'],
})
export class ContactsTableComponent {
  contacts = input.required<Contact[]>();
}
