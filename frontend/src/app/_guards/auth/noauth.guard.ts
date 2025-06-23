import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../_services/auth/auth.service';
import { inject } from '@angular/core';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if(!authService.isUserAuthenticated()){
    return true; // Permette l'accesso se NON autenticato
  } else {
    return router.parseUrl("/"); // Reindirizza alla home se già autenticato
  }
};
