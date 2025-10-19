import { Component, EventEmitter, input, Output, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { User } from 'src/app/users/users/interfaces/user.interfase';

@Component({
  selector: 'users-table',
  imports: [RouterLink, ConfirmDialogComponent],
  templateUrl: './users-table.component.html',
  styleUrl: './users-table.component.css',
})
export class UsersTableComponent {
  users = input.required<User[]>();

  @Output() delete = new EventEmitter<string>();
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;
  async onDelete(id: string) {
    const confirmed = await this.confirmDialog.open('¿Estás seguro que deseas eliminar este usuario?');

    if (confirmed) {
      this.delete.emit(id);
    }
  }

  getUserRolesPlain(user: User) {
    return user.roles.join(', ');
  }
}
