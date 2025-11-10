import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { AgGridAngular } from 'ag-grid-angular'; // Angular Data Grid Component
import { ColDef, GridApi, GridOptions } from 'ag-grid-community'; // Column Definition Type Interface

@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [AgGridAngular, NgbPaginationModule, FormsModule],
  templateUrl: './grid.html',
  styleUrl: './grid.scss',
})
export class Grid {
  pagination = true;
  public paginationPageSizeSelector = [10, 20, 50, 100, 200, 500, 1000];
  PageIndex: number = 1;
  TotalRecords: number = 10;
  private gridAPI: GridApi;
  defaultColDef: ColDef = {
    flex: 1,
    autoHeight: true,
    wrapText: true
  };
  gridOptions: GridOptions = {
    theme: 'legacy',
    autoSizeStrategy: {
      type: "fitCellContents",
    },
    domLayout: "autoHeight",
    pagination: true,
    paginationPageSize: 10,
    paginationPageSizeSelector: this.paginationPageSizeSelector,
    overlayNoRowsTemplate: "No record found!",
    suppressPaginationPanel: true,
    defaultColDef: this.defaultColDef
  };

  // Row Data: The data to be displayed.
  @Input() rowData = [];

  // Column Definitions: Defines the columns to be displayed.
  @Input() colDefs: ColDef[] = [];

  @Output() paginationData = new EventEmitter<any>();

  onSortChange(event: any) {
    this.onPaginationChanged();
  }

  onGridReady(event: any) {
    this.gridAPI = event.api;
  }

  onPaginationChanged() {
    // this.PageIndex = this.gridAPI.paginationGetCurrentPage();
    // this.PageSize = this.gridAPI.paginationGetPageSize();
    const colState = this.gridAPI?.getColumnState();
    var sortState = colState?.filter(function (s) {
      return s.sort != null;
    }).map(function (s) {
      return { colId: s.colId, sort: s.sort, sortIndex: s.sortIndex };
    });
    const { colId = '', sort = '' } = sortState?.length > 0 ? sortState[0] : {};
    this.paginationData.emit({
      PageIndex: this.PageIndex,
      PageSize: this.gridOptions.paginationPageSize,
      SortColumn: colId,
      SortOrder: sort
    });
  }

  ngOnChanges(event: SimpleChanges) {
    let rowData = event["rowData"].currentValue;
    if (rowData?.length > 0) {
      this.TotalRecords = rowData[0].totalRecords;
    }
    else {
      this.TotalRecords = 0;
    }
  }
}
