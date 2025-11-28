import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlTree } from '@angular/router';
import { catchError, from, map, Observable, of, switchMap } from 'rxjs';
import { AuthService } from '@auth/auth.service';
import { CartService } from '../../carts/services/cart.service';

export const CheckoutGuard: CanMatchFn = (): Observable<boolean | UrlTree> => {
  const auth = inject(AuthService);
  const cart = inject(CartService);
  const router = inject(Router);

  return from(auth.checkStatus()).pipe(
    switchMap(isAuthenticated => {
      if (!isAuthenticated) {
        return of(router.createUrlTree(['/auth/login']));
      }

      return (cart.loadCart(true) as Observable<unknown>).pipe(
        map((items) => {
          const list = Array.isArray(items) ? items : [];
          return list.length > 0 ? true : router.createUrlTree(['/cart']);
        }),
        catchError(() => of(router.createUrlTree(['/cart'])))
      );
    })
  );
};
