import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '@shared/services/toast.service';

export function errorToastInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        const errorBody = err.error as { expose?: boolean; message?: string } | undefined;
        if (errorBody?.expose) {
          const message = errorBody.message || 'Ocurrio un error';
          toast.activateError(message);
        }
      }
      return throwError(() => err);
    })
  );
}
