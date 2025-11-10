import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { BookingRoutingModule } from './booking-routing-module';
import { BookingList } from './booking-list/booking-list';
import { BookingDetails } from './booking-details/booking-details';
import { SharedModule } from '../../component/shared/shared-module';


@NgModule({
  declarations: [
    BookingList,
    BookingDetails
  ],
  imports: [
    CommonModule,
    BookingRoutingModule,
    SharedModule
  ],
  providers:[DatePipe]
})
export class BookingModule { }
