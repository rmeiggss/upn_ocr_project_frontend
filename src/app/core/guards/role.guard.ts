import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);
  const router = inject(Router);

  const expectedRoles = route.data?.['roles'] as Array<string>;
  const currentRole = authService.userRole();

  if (!expectedRoles || expectedRoles.length === 0 || expectedRoles.includes(currentRole) || currentRole === 'Administrador') {
    return true;
  }

  notificationService.warning(`Acceso denegado: El rol [${currentRole}] no tiene autorización para esta vista.`);
  router.navigate(['/']);
  return false;
};
