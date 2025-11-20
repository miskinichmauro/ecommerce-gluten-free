import { Component, EventEmitter, input, Output, ViewChild } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Contact } from '../../interfaces/contact.interface';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { TableActionButtonsComponent } from 'src/app/shared/components/table-action-buttons/table-action-buttons.component';

@Component({
  selector: 'contacts-table',
  imports: [RouterLink, ConfirmDialogComponent, TableActionButtonsComponent],
  templateUrl: './contacts-table.component.html',
  styleUrls: ['./contacts-table.component.css'],
})
export class ContactsTableComponent {
  contacts = input.required<Contact[]>();

  @Output() delete = new EventEmitter<string>();
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;
  async onDelete(id: string) {
    const confirmed = await this.confirmDialog.open('¿Estás seguro que deseas eliminar este contacto?');

    if (confirmed) {
      this.delete.emit(id);
    }
  }
}
