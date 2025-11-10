import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InstructorList } from './instructor-list/instructor-list';
import { InstructorDetail } from './instructor-detail/instructor-detail';

const routes: Routes = [
  {
    path: '',
    component:InstructorList
  },
  {
    path: 'instructor-detail/:id',
    component: InstructorDetail
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InstructorRoutingModule { }
