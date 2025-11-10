import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudentList } from './student-list/student-list';
import { StudentDetail } from './student-detail/student-detail';

const routes: Routes = [
  {
    path: '',
    component: StudentList
  },
  {
    path: 'student-detail/:id',
    component: StudentDetail
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentRoutingModule { }
