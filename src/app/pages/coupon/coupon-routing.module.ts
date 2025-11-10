import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CouponList } from './coupon-list/coupon-list';

const routes: Routes = [
  {
    path: '',
    component:CouponList
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CouponRoutingModule { }
