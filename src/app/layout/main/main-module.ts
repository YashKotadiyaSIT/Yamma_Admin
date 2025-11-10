import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainRoutingModule } from './main-routing-module';
import { SharedModule } from '../../component/shared/shared-module';
import { MyProfile } from '../../component/my-profile/my-profile';


@NgModule({
  declarations: [MyProfile],
  imports: [
    CommonModule,
    MainRoutingModule,
    SharedModule
  ]
})
export class MainModule { }
