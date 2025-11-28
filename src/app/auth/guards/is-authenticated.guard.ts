import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../auth.service';

export const IsAuthenticated: CanMatchFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = await firstValueFrom(authService.checkStatus());

  if (!isAuthenticated) {
    return router.createUrlTree(['/']);
  }

  return true;
};
