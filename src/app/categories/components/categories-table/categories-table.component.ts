import { Component, EventEmitter, input, Output, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { Category } from '../../interfaces/category.interface';

@Component({
  selector: 'categories-table',
  imports: [RouterLink, ConfirmDialogComponent],
  templateUrl: './categories-table.component.html',
  styleUrl: './categories-table.component.css',
})
export class CategoriesTableComponent {
  categories = input.required<Category[]>();

  @Output() delete = new EventEmitter<string>();
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  async onDelete(id: string) {
    const confirmed = await this.confirmDialog.open('¿Estás seguro que deseas eliminar esta categoría?');

    if (confirmed) {
      this.delete.emit(id);
    }
  }
}

