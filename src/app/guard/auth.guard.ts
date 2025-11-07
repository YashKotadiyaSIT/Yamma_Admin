import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../service/authService/auth.service';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const toastrService = inject(ToastrService);

  if (authService.isLoggedIn()) {
    return true;
  } else {
    toastrService.info('You need to login to access the portal.', 'Login Required');
    authService.logout();
    return false;
  }
};
