import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SlotRoutingModule } from './slot-routing-module';
import { SlotList } from './slot-list/slot-list';
import { SlotDetails } from './slot-details/slot-details';
import { SharedModule } from '../../component/shared/shared-module';


@NgModule({
  declarations: [
    SlotList,
    SlotDetails
  ],
  imports: [
    CommonModule,
    SlotRoutingModule,
    SharedModule
  ]
})
export class SlotModule { }
