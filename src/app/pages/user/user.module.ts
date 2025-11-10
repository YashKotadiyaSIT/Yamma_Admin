import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRoutingModule } from './user-routing.module';
import { UserList } from './user-list/user-list';
import { UserAddedit } from './user-addedit/user-addedit';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { SharedModule } from '../../component/shared/shared-module';

@NgModule({
  declarations: [
    UserList,
    UserAddedit
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class UserModule { }
