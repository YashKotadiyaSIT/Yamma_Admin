import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CouponRoutingModule } from './coupon-routing.module';
import { CouponList } from './coupon-list/coupon-list';
import { CouponAddedit } from './coupon-addedit/coupon-addedit';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { SharedModule } from '../../component/shared/shared-module';

@NgModule({
  declarations: [
    CouponList,
    CouponAddedit
  ],
  imports: [
    CommonModule,
    CouponRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class CouponModule { }
