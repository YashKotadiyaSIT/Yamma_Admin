import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '../../guard/auth.guard';
// import { authGuard } from '../../guard/auth.guard';

const routes: Routes = [
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      import('../../pages/dashboard/dashboard-module').then(
        (m) => m.DashboardModule
      ),
  },
  {
    path: 'user',
    canActivate: [authGuard],
    loadChildren: () =>
      import('../../pages/user/user.module').then(
        (m) => m.UserModule
      ),
  },
  {
    path: 'instructor',
    canActivate: [authGuard],
    loadChildren: () =>
      import('../../pages/instructor/instructor.module').then(
        (m) => m.InstructorModule
      ),
  },
  {
    path: 'student',
    canActivate: [authGuard],
    loadChildren: () =>
      import('../../pages/student/student.module.js').then(
        (m) => m.StudentModule
      ),
  },
  {
    path: 'coupon',
    canActivate: [authGuard],
    loadChildren: () =>
      import('../../pages/coupon/coupon.module.js').then(
        (m) => m.CouponModule
      ),
  },
  {
    path: 'slot',
    canActivate: [authGuard],
    loadChildren: () =>
      import('../../pages/slot/slot-module').then(
        (m) => m.SlotModule
      ),
  },
  {
    path: 'booking',
    canActivate: [authGuard],
    loadChildren: () =>
      import('../../pages/booking/booking-module').then(
        (m) => m.BookingModule
      ),
  },
  {
    path: 'setting',
    canActivate: [authGuard],
    loadChildren: () =>
      import('../../pages/setting/setting-module').then(
        (m) => m.SettingModule
      ),
  },
  {
    path: 'redirect',
    canActivate: [authGuard],
    loadChildren: () =>
      import('../../pages/stripe-configuration/stripe-configuration-module').then(
        (m) => m.StripeConfigurationModule
      ),
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
