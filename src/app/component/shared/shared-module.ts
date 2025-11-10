import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgScrollbarModule } from 'ngx-scrollbar';
// import { Card } from '../card/card';
import { NgbModule, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { Card } from '../card/card';
import { Grid } from '../grid/grid';
import { Breadcrumbs } from '../breadcrumbs/breadcrumbs';
import { NgSelectModule } from '@ng-select/ng-select';
// import { Breadcrumbs } from '../breadcrumbs/breadcrumbs';
// import { Grid } from '../grid/grid';

@NgModule({
  declarations: [
    
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    Card,
    Grid,
    NgbModule,
    NgScrollbarModule,
    NgbCollapseModule,
    Breadcrumbs
  ],
  exports:[
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    Card,
    Grid,
    NgbModule,
    NgScrollbarModule,
    NgbCollapseModule,
    Breadcrumbs,
    NgSelectModule
  ]
})
export class SharedModule { }
