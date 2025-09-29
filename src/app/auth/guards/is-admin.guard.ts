import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { AuthService } from '../auth.service';
import { firstValueFrom } from 'rxjs';

export const IsAdmin: CanMatchFn = async () => {
  const authService = inject(AuthService);
  await firstValueFrom(authService.checkStatus());
  return authService.isAdmin();
}
