import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstructorRoutingModule } from './instructor-routing.module';
import { InstructorList } from './instructor-list/instructor-list';
import { InstructorDetail } from './instructor-detail/instructor-detail';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { SharedModule } from '../../component/shared/shared-module';

@NgModule({
  declarations: [
    InstructorList,
    InstructorDetail
  ],
  imports: [
    CommonModule,
    InstructorRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class InstructorModule { }
