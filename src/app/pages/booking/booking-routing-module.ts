import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookingList } from './booking-list/booking-list';
import { BookingDetails } from './booking-details/booking-details';

const routes: Routes = [
  {
    path:"",
    pathMatch:'full',
    redirectTo: 'list'
  },
  {
    path:"list",
    component:BookingList
  },
  {
    path:"details/:id",
    component:BookingDetails
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BookingRoutingModule { }
