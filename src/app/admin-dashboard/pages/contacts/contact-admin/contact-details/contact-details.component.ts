import { Component, HostListener, inject, input, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Contact } from 'src/app/contacts/interfaces/contact.interface';
import { FormErrorLabelComponent } from 'src/app/shared/components/form-error-label/form-error-label.component';
import { ContactService } from 'src/app/contacts/services/contact.service';
import { Router } from '@angular/router';

@Component({
  selector: 'contact-details',
  imports: [ReactiveFormsModule, FormErrorLabelComponent],
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.css'],
})
export class ContactDetailsComponent implements OnInit {
  contact = input.required<Contact>();
  
  router = inject(Router);
  contactService = inject(ContactService);

  fb = inject(FormBuilder);

  contactForm = this.fb.group({
    title: ['', Validators.required],
    phone: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    this.contactForm.reset(this.contact());
  }

  onSubmit() {
    this.contactForm.markAllAsTouched();
    const formValue = this.contactForm.value;

    const contactData: Partial<Contact> = {
      ...(formValue as any),
    };

    if (this.contact().id === 'new') {
      this.contactService.create(contactData).subscribe();
    } else {
      this.contactService.update(this.contact().id, contactData).subscribe();
    }
    this.router.navigate(['/admin/contacts']);
  }

  controlPresionado: boolean = false;
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Control') {
      this.controlPresionado = true;
    } else if (event.key === 'Enter' && this.controlPresionado) {
      this.onSubmit();
    }
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyboardUp(event: KeyboardEvent) {
    if (event.key === 'Control') {
      this.controlPresionado = false;
    }
  }
}
