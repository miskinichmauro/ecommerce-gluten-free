import { Component, EventEmitter, input, Output, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { Tag } from '../../interfaces/tag.interface';
import { TableActionButtonsComponent } from 'src/app/shared/components/table-action-buttons/table-action-buttons.component';

@Component({
  selector: 'tags-table',
  imports: [RouterLink, ConfirmDialogComponent, TableActionButtonsComponent],
  templateUrl: './tags-table.component.html',
  styleUrl: './tags-table.component.css',
})
export class TagsTableComponent {
  tags = input.required<Tag[]>();

  @Output() delete = new EventEmitter<string>();
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

  async onDelete(id: string) {
    const confirmed = await this.confirmDialog.open('¿Estás seguro que deseas eliminar este tag?');

    if (confirmed) {
      this.delete.emit(id);
    }
  }
}
