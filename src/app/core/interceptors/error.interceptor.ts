import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        notificationService.warning('Su sesión ha expirado o las credenciales no son válidas.');
        authService.logout();
      } else if (error.status === 403) {
        notificationService.error('No tiene los permisos requeridos para ejecutar esta acción.');
      } else if (error.status >= 500) {
        notificationService.error('Error interno del servidor. Activando modo resiliente / local.');
      }
      return throwError(() => error);
    })
  );
};
