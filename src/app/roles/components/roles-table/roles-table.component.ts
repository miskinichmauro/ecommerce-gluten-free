import { Component, EventEmitter, input, Output, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { Role } from 'src/app/roles/interfaces/role.interface';
import { TableActionButtonsComponent } from 'src/app/shared/components/table-action-buttons/table-action-buttons.component';

@Component({
  selector: 'roles-table',
  imports: [RouterLink, ConfirmDialogComponent, TableActionButtonsComponent],
  templateUrl: './roles-table.component.html',
  styleUrl: './roles-table.component.css',
})
export class RolesTableComponent {
  roles = input.required<Role[]>();

  @Output() delete = new EventEmitter<string>();
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;
  async onDelete(id: string) {
    const confirmed = await this.confirmDialog.open('¿Estás seguro que deseas eliminar este rol?');

    if (confirmed) {
      this.delete.emit(id);
    }
  }
}
