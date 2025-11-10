import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrivacyPolicyRoutingModule } from './privacy-policy-routing-module';
import { PrivacyPolicy } from './privacy-policy';
import { SharedModule } from '../../component/shared/shared-module';


@NgModule({
  declarations: [PrivacyPolicy],
  imports: [
    CommonModule,
    PrivacyPolicyRoutingModule,
    SharedModule
  ]
})
export class PrivacyPolicyModule { }
