import { Component, inject, input, OnInit } from '@angular/core';
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
  router = inject(Router);
  contactService = inject(ContactService);
  contact = input.required<Contact>();

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
      this.contactService.create(contactData).subscribe((contact) => {
        this.router.navigate(['/admin/contacts']);
      });
    } else {
      this.contactService.update(this.contact().id, contactData).subscribe();
    }
  }
}
