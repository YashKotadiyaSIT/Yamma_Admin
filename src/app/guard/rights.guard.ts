import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, CanActivateFn } from '@angular/router';
import { AuthService } from '../service/authService/auth.service';
import { ToastrService } from 'ngx-toastr';

export const rightsGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const auth = inject(AuthService);
    const toastr = inject(ToastrService);
    const router = inject(Router);

    const menuId = route.data['menuId'];
    const right = route.data['right'] || 'IsView';

    if (auth.hasRight(menuId, right)) {
        return true;
    }

    toastr.error('You do not have permission to access this page.', 'Access Denied');
    router.navigate(['/**']);
    return false;
};

