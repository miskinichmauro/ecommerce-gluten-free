import { Component, EventEmitter, input, Output, output, ViewChild } from '@angular/core';
import { RouterLink } from "@angular/router";
import { SlicePipe } from '@angular/common';
import { Recipe } from '../../interfaces/recipe.interface';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { TableActionButtonsComponent } from 'src/app/shared/components/table-action-buttons/table-action-buttons.component';

@Component({
  selector: 'recipes-table',
  imports: [RouterLink, SlicePipe, ConfirmDialogComponent, TableActionButtonsComponent],
  templateUrl: './recipes-table.component.html',
  styleUrls: ['./recipes-table.component.css'],
})
export class RecipesTableComponent {
  recipes = input.required<Recipe[]>();

  @Output() delete = new EventEmitter<string>();
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;
  async onDelete(id: string) {
    const confirmed = await this.confirmDialog.open('¿Estás seguro que deseas eliminar esta receta?');

    if (confirmed) {
      this.delete.emit(id);
    }
  }
}
