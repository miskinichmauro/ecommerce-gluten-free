import { Component, EventEmitter, Output, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'table-action-buttons',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './table-action-buttons.component.html',
  styleUrl: './table-action-buttons.component.css',
})
export class TableActionButtonsComponent {
  editLink = input<any[] | string | null>(null);

  @Output() delete = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();

  onDeleteClick() {
    this.delete.emit();
  }

  onEditClick() {
    this.edit.emit();
  }
}
