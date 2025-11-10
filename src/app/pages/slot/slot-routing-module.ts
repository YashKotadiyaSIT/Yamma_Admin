import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SlotList } from './slot-list/slot-list';
import { SlotDetails } from './slot-details/slot-details';

const routes: Routes = [
  {
    path:'',
    pathMatch:'full',
    redirectTo:'list'
  },
  {
    path:'list',
    component:SlotList
  },
  {
    path:'details/:id',
    component:SlotDetails
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SlotRoutingModule { }
