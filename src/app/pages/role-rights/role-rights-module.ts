import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RoleRightsRoutingModule } from './role-rights-routing-module';
import { RoleAddEdit } from './role-add-edit/role-add-edit';
import { RoleList } from './role-list/role-list';
import { RoleView } from './role-view/role-view';
import { SharedModule } from '../../component/shared/shared-module';


@NgModule({
  declarations: [
    RoleAddEdit,
    RoleList,
    RoleView
  ],
  imports: [
    CommonModule,
    RoleRightsRoutingModule,
    SharedModule
  ]
})
export class RoleRightsModule { }
