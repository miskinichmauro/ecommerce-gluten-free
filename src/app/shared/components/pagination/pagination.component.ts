import { Component, computed, input, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'pagination',
  imports: [RouterLink],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
})
export class PaginationComponent {
  pages = input<number>(0);
  currentPage = input<number>(1);

  activePage = linkedSignal(this.currentPage);

  readonly totalPages = computed(() => Math.max(0, this.pages() ?? 0));
  readonly getPagesList = computed(() => {
    const total = this.totalPages();
    return total ? Array.from({ length: total }, (_, i) => i + 1) : [];
  });
  readonly isFirstPage = computed(() => this.activePage() <= 1);
  readonly isLastPage = computed(() => this.activePage() >= this.totalPages() && this.totalPages() > 0);
  readonly previousPage = computed(() => Math.max(1, this.activePage() - 1));
  readonly nextPage = computed(() => Math.min(this.totalPages(), this.activePage() + 1));

  goToPage(page: number) {
    if (!this.totalPages()) return;
    const clamped = Math.min(Math.max(page, 1), this.totalPages());
    this.activePage.set(clamped);
  }
}
