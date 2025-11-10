import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgScrollbarModule } from 'ngx-scrollbar';
// import { Card } from '../card/card';
import { NgbModule, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { Card } from '../card/card';
import { Grid } from '../grid/grid';
import { Breadcrumbs } from '../breadcrumbs/breadcrumbs';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { AgGridModule } from 'ag-grid-angular';
import { NgSelectModule } from '@ng-select/ng-select';
// import { Breadcrumbs } from '../breadcrumbs/breadcrumbs';
// import { Grid } from '../grid/grid';

ModuleRegistry.registerModules([AllCommunityModule]);

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
    Breadcrumbs,
    AgGridModule
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
