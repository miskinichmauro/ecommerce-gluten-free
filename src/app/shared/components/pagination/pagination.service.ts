import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';

@Injectable({providedIn: 'root'})
export class PaginationService {
  private readonly activateRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  currentPage = toSignal(
    this.activateRoute.queryParamMap.pipe(
      map(params => (params.get('page') ? +params.get('page')! : 1)),
      map(page => (isNaN(page) ? 1 : page))
    ),
    { initialValue: 1 }
  );

  setPage(page: number) {
    this.router.navigate([], {
      queryParams: { page },
      queryParamsHandling: 'merge',
    });
  }
}
