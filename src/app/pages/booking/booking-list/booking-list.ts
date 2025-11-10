import { DatePipe } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ColDef } from 'ag-grid-community';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiUrlHelper } from '../../../common/api-url-helper';
import { statusList } from '../../../common/Constants/common';
import { IPagination } from '../../../interface/common-interface';
import { CommonService } from '../../../service/common/common.service';
import { ActionButtonRenderer } from '../../../component/action-button-renderer/action-button-renderer';

@Component({
  selector: 'app-booking-list',
  standalone: false,
  templateUrl: './booking-list.html',
  styleUrl: './booking-list.scss',
})
export class BookingList {
  bookingListData: any = [];
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
  statusList = statusList;
  filters = {
    studentId: null,
    instructorId: null,
    startTime: null,
    endTime: null,
    status: 0
  };
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
      { headerName: 'bookingid', field: 'bookingId', hide: true },
      {
        headerName: 'Student Name', field: 'studentName', resizable: false, minWidth: 350,
        comparator: (valueA: string, valueB: string, nodeA: any, nodeB: any) => {
          const startA = new Date(nodeA.data.studentName).getTime();
          const startB = new Date(nodeB.data.studentName).getTime();
          return startA - startB; // proper date comparison
        }
      },
      {
        headerName: 'Instructor Name', field: 'instructorName', resizable: false, minWidth: 350,
        comparator: (valueA: string, valueB: string, nodeA: any, nodeB: any) => {
          const startA = new Date(nodeA.data.instructorName).getTime();
          const startB = new Date(nodeB.data.instructorName).getTime();
          return startA - startB; // proper date comparison
        }
      },
      {
        headerName: 'Date of booking',
        field: 'dateOfBooking',
        minWidth: 300,
        valueFormatter: (params: any) => {
          return this.datePipe.transform(params.value, 'dd/MM/yyyy HH:mm');
        },
        resizable: false
      },
      {
        headerName: 'Total Amount',
        field: 'totalAmount',
        minWidth: 300,
        resizable: false
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
    this.getBookingData();
  }

  onPaginationChanged(event: any) {
    this.paginationData = event;
    this.getBookingData();
  }

  onSearchtextChange() {
    if (this.searchData.length >= 3 || this.searchData.length === 0) {
    }
  }

  getBookingData() {
    if (this.isLoading) return; // prevent multiple calls
    this.isLoading = true;
    let data = {
      PageNumber: this.paginationData.PageIndex,
      PageSize: this.paginationData.PageSize,
      StrSearch: this.searchData,
      SortColumn: this.paginationData.SortColumn,
      SortOrder: this.paginationData.SortOrder,
      bookingDate: "",
      studentId: this.filters.studentId || null,
      instructorId: this.filters.instructorId || null,
      startTime: this.filters.startTime || null,
      endTime: this.filters.endTime || null,
      status: this.filters.status || 0
    };

    let apiUrl = this.apiUrl.apiUrl.booking.BookingList;
    this.spinner.show();
    this.commonService
      .doPost(apiUrl, data)
      .pipe()
      .subscribe({
        next: (response) => {
          this.spinner.hide();
          this.isLoading = false;
          if (response.success) {
            this.bookingListData = response.data.booking;
            this.studentList = response.data.studentList;
            this.instructorList = response.data.instructorList;

          } else {
            this.bookingListData = [];
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
    this.router.navigate(['/booking/details', this.commonService.Encrypt(data.bookingId.toString())]);
  }

  resetFilters() {
    this.filters = { studentId: null, instructorId: null, startTime: null, endTime: null, status: 0 };
    this.applyFilters();
  }

  applyFilters() {
    this.paginationData.PageIndex = 1; // Reset to first page when filters are applied
    this.getBookingData();
  }

}
