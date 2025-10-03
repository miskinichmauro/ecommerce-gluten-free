import { Component, input } from '@angular/core';
import { Contact } from '../../interfaces/contact.interface';

@Component({
  selector: 'contact-card',
  imports: [],
  templateUrl: './contact-card.component.html',
  styleUrl: './contact-card.component.css',
})
export class ContactCardComponent {
  contact = input.required<Contact>();
}
