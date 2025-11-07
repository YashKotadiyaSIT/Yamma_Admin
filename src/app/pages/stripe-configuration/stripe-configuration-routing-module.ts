import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StripeConfiguration } from './stripe-configuration';

const routes: Routes = [
  {path:'', component: StripeConfiguration}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StripeConfigurationRoutingModule { }
