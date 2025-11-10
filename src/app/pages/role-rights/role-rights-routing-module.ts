import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleList } from './role-list/role-list';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'list'
  },
  {
    path: 'list',
    component: RoleList
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoleRightsRoutingModule { }
