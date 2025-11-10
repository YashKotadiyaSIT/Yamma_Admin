import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentRoutingModule } from './student-routing.module';
import { StudentList } from './student-list/student-list';
import { StudentDetail } from './student-detail/student-detail';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { SharedModule } from '../../component/shared/shared-module';

@NgModule({
  declarations: [
    StudentList,
    StudentDetail
  ],
  imports: [
    CommonModule,
    StudentRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class StudentModule { }
