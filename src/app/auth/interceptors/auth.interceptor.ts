import { HttpHandlerFn, HttpRequest } from "@angular/common/http";

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const accessToken = localStorage.getItem('access_token');
  const newReq = req.clone({
    headers: req.headers.append('Authorization', `Bearer ${accessToken}`),
  });

  return next(newReq);
}
