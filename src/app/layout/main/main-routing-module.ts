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
    path: 'redirect',
    canActivate: [authGuard],
    loadChildren: () =>
      import('../../pages/stripe-configuration/stripe-configuration-module').then(
        (m) => m.StripeConfigurationModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
