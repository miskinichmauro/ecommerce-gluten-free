import { Component, HostListener, inject, input, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormErrorLabelComponent } from '@shared/components/form-error-label/form-error-label.component';
import { firstValueFrom } from 'rxjs';
import { Category } from 'src/app/categories/interfaces/category.interface';
import { CategoryService } from 'src/app/categories/services/category.service';

@Component({
  selector: 'category-details',
  imports: [ReactiveFormsModule, FormErrorLabelComponent],
  templateUrl: './category-details.component.html',
  styleUrl: './category-details.component.css',
})
export class CategoryDetailsComponent implements OnInit {
  category = input.required<Category>();

  router = inject(Router);
  categoryService = inject(CategoryService);
  fb = inject(FormBuilder);

  categoryForm = this.fb.group({
    name: ['', Validators.required],
  });

  ngOnInit(): void {
    this.categoryForm.reset(this.category());
  }

  async onSubmit() {
    this.categoryForm.markAllAsTouched();
    if (this.categoryForm.invalid) {
      return;
    }

    const categoryData: Partial<Category> = {
      ...(this.categoryForm.value as any),
    };

    if (this.category().id === 'new') {
      await firstValueFrom(this.categoryService.create(categoryData));
    } else {
      await firstValueFrom(this.categoryService.update(this.category().id, categoryData));
    }

    this.router.navigate(['/admin/categories']);
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

