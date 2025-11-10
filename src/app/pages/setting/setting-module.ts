import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingRoutingModule } from './setting-routing-module';
import { Setting } from './setting';
import { PrivacyPolicy } from './privacy-policy/privacy-policy';
import { TermsConditions } from './terms-conditions/terms-conditions';
import { CommissionManagement } from './commission-management/commission-management';
import { SharedModule } from '../../component/shared/shared-module';
import { AngularEditorModule } from '@kolkov/angular-editor';


@NgModule({
  declarations: [
    Setting,
    PrivacyPolicy,
    TermsConditions,
    CommissionManagement
  ],
  imports: [
    CommonModule,
    SettingRoutingModule,
    SharedModule,
    AngularEditorModule
  ]
})
export class SettingModule { }
