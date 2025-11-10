import { DatePipe } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ColDef } from 'ag-grid-community';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiUrlHelper } from '../../../common/api-url-helper';
import { statusList, activelesson } from '../../../common/Constants/common';
import { ActionButtonRenderer } from '../../../component/action-button-renderer/action-button-renderer';
import { IPagination } from '../../../interface/common-interface';
import { CommonService } from '../../../service/common/common.service';

@Component({
  selector: 'app-slot-list',
  standalone: false,
  templateUrl: './slot-list.html',
  styleUrl: './slot-list.scss',
})
export class SlotList {
  slotListData: any = [];
  columnDefination: ColDef[] = [];
  searchData: string;
  verificationStatus: number = 0;
  paginationData: IPagination = {
    PageIndex: 1,
    PageSize: 10,
    SortColumn: '',
    SortOrder: ''
  };
  isLoading: boolean = false;
  filters = {
    studentId: null,
    instructorId: null,
    startTime: null,
    endTime: null,
    status: 0,
    lessonstatus: 0
  };
  statusList = statusList;
  activelesson = activelesson;
  studentList: { id: number, name: string; }[] = [];
  instructorList: { id: number, name: string; }[] = [];

  @ViewChild('searchInput') searchInputRef!: ElementRef;

  constructor(
    private apiUrl: ApiUrlHelper,
    private commonService: CommonService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private datePipe: DatePipe
  ) {

  }

  ngOnInit() {
    this.columnDefination = [
      { headerName: 'bookingdetailid', field: 'bookingDetailId', hide: true },
      {
        headerName: 'Student Name', field: 'studentName', resizable: false, minWidth: 200,
        comparator: (valueA: string, valueB: string, nodeA: any, nodeB: any) => {
          const startA = new Date(nodeA.data.studentName).getTime();
          const startB = new Date(nodeB.data.studentName).getTime();
          return startA - startB; // proper date comparison
        }
      },
      {
        headerName: 'Instructor Name', field: 'instructorName', resizable: false, minWidth: 200,
        comparator: (valueA: string, valueB: string, nodeA: any, nodeB: any) => {
          const startA = new Date(nodeA.data.instructorName).getTime();
          const startB = new Date(nodeB.data.instructorName).getTime();
          return startA - startB; // proper date comparison
        }
      },
      {
        headerName: 'Lesson Start Date',
        field: 'lessonStartTime',
        minWidth: 300,
        valueFormatter: (params: any) => {
          return this.datePipe.transform(params.value, 'dd/MM/yyyy HH:mm');
        },
        resizable: false
      },
      {
        headerName: 'Lesson End Date',
        field: 'lessonEndTime',
        minWidth: 300,
        valueFormatter: (params: any) => {
          return this.datePipe.transform(params.value, 'dd/MM/yyyy HH:mm');
        },
        resizable: false
      },
      {
        headerName: 'Slot Status',
        field: 'bookingStatus',
        resizable: false,
        sortable: false,
        cellRenderer: (params: any) => {
          ;
          const status = params.value; // Ensure numeri
          let badgeClass = '';
          let statusText = '';

          switch (status) {
            case "Approved": // Verified
              badgeClass = 'bg-success';
              statusText = 'Approved';
              break;
            case "Pending": // Pending
              badgeClass = 'bg-warning';
              statusText = 'Pending';
              break;
            case "Rejected": // Rejected / Failed
              badgeClass = 'bg-danger';
              statusText = 'Rejected';
              break;
            default:
              badgeClass = 'bg-secondary';
              statusText = 'Unknown';
          }

          return `<span class="badge ${badgeClass}">${statusText}</span>`;
        }

      },


      {
        headerName: 'Actions',
        resizable: false,
        sortable : false,
        cellRenderer: ActionButtonRenderer,
        cellRendererParams: (params: any) => {
          let btnAry = [
            {
              img: 'assets/images/view.svg',   // or icon: 'fas fa-eye'
              alt: 'View',
              class: 'btn btn-link p-0 me-2',
              action: (data: any) => this.onView(data)
            }
          ];
          return {
            containerClass: 'button-container', // Add a class for alignment
            buttons: btnAry
          };
        }
      }
    ];
    this.getSlotData();
  }


  onPaginationChanged(event: any) {
    this.paginationData = event;
    this.getSlotData();
  }

  getSlotData() {
    if (this.isLoading) return; // prevent multiple calls
    this.isLoading = true;
    let data = {
      pageNumber: this.paginationData.PageIndex,
      pageSize: this.paginationData.PageSize,
      strSearch: this.searchData,
      sortColumn: this.paginationData.SortColumn,
      sortOrder: this.paginationData.SortOrder,
      bookingDate: "",
      studentId: this.filters.studentId || null,
      instructorId: this.filters.instructorId || null,
      startTime: this.filters.startTime || null,
      endTime: this.filters.endTime || null,
      status: this.filters.status || 0,
      lessonstatus : this.filters.lessonstatus || 0,
    };

    let apiUrl = this.apiUrl.apiUrl.slot.SlotList;
    this.spinner.show();
    this.commonService
      .doPost(apiUrl, data)
      .pipe()
      .subscribe({
        next: (response) => {
          this.spinner.hide();
          this.isLoading = false;
          if (response.success) {
            this.slotListData = response.data.slots;
            this.studentList = response.data.studentList;
            this.instructorList = response.data.instructorList;
          } else {
            this.slotListData = [];
          }
          setTimeout(() => {
            this.searchInputRef?.nativeElement?.focus();
          }, 0);
        },
        error: (err) => {
          this.isLoading = false;
          this.spinner.hide();
          console.error(err);
        },
      });
  }



  onView(data: any) {
    this.router.navigate(['/slot/details', this.commonService.Encrypt(data.bookingDetailId.toString())]);
  }

  applyFilters() {
    this.paginationData.PageIndex = 1; // Reset to first page when filters are applied
    this.getSlotData();
  }

  resetFilters() {
    this.filters = { studentId: null, instructorId: null, startTime: null, endTime: null, status: 0, lessonstatus: 0 };
    this.applyFilters();
  }

 
  onDateChange(value: string, field: 'startTime' | 'endTime') {
    if (!value) {
      this.filters[field] = null;
      return;
    }
    this.filters[field] = new Date(value); // yyyy-MM-dd → JS Date
  }


}
