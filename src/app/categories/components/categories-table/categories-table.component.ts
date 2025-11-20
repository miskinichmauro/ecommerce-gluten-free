import { Component, EventEmitter, input, Output, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { Category } from '../../interfaces/category.interface';
import { TableActionButtonsComponent } from 'src/app/shared/components/table-action-buttons/table-action-buttons.component';

@Component({
  selector: 'categories-table',
  imports: [RouterLink, ConfirmDialogComponent, TableActionButtonsComponent],
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
