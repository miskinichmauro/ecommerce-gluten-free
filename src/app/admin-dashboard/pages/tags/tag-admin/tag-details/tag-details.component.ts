import { Component, HostListener, inject, input, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormErrorLabelComponent } from '@shared/components/form-error-label/form-error-label.component';
import { firstValueFrom } from 'rxjs';
import { Tag } from 'src/app/tags/interfaces/tag.interface';
import { TagService } from 'src/app/tags/services/tag.service';

@Component({
  selector: 'tag-details',
  imports: [ReactiveFormsModule, FormErrorLabelComponent],
  templateUrl: './tag-details.component.html',
  styleUrl: './tag-details.component.css',
})
export class TagDetailsComponent implements OnInit {
  tag = input.required<Tag>();

  router = inject(Router);
  tagService = inject(TagService);
  fb = inject(FormBuilder);

  tagForm = this.fb.group({
    name: ['', Validators.required],
  });

  ngOnInit(): void {
    this.tagForm.reset(this.tag());
  }

  async onSubmit() {
    this.tagForm.markAllAsTouched();
    if (this.tagForm.invalid) {
      return;
    }

    const tagData: Partial<Tag> = {
      ...(this.tagForm.value as any),
    };

    if (this.tag().id === 'new') {
      await firstValueFrom(this.tagService.create(tagData));
    } else {
      await firstValueFrom(this.tagService.update(this.tag().id, tagData));
    }

    this.router.navigate(['/admin/tags']);
  }

  controlPresionado = false;

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

