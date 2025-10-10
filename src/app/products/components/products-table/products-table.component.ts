import { Component, EventEmitter, input, Output, signal, ViewChild } from '@angular/core';
import { Product } from '../../interfaces/product';
import { ProductImagePipe } from '../../pipes/product-image.pipe';
import { RouterLink } from "@angular/router";
import { CurrencyPipe } from '@angular/common';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'products-table',
  imports: [ProductImagePipe, RouterLink, CurrencyPipe, ConfirmDialogComponent],
  templateUrl: './products-table.component.html',
  styleUrl: './products-table.component.css',
})
export class ProductsTableComponent {
  products = input.required<Product[]>();
  currentPage = input.required<number>();
  countPage = input.required<number>();

  @Output() delete = new EventEmitter<string>();
  @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;
  async onDelete(id: string) {
    console.log();
    const confirmed = await this.confirmDialog.open('¿Estás seguro que deseas eliminar este producto?');

    if (confirmed) {
      this.delete.emit(id);
    }
  }
}
