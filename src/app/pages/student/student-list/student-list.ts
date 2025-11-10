import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { ApiUrlHelper } from '../../../common/api-url-helper';
import { MENU, RIGHTS } from '../../../common/Constants/EnumConstants';
import { IPagination } from '../../../interface/common-interface';
import { AuthService } from '../../../service/authService/auth.service';
import { CommonService } from '../../../service/common/common.service';
import { ActionButtonRenderer } from '../../../component/action-button-renderer/action-button-renderer';

@Component({
  selector: 'app-student-list',
  standalone: false,
  templateUrl: './student-list.html',
  styleUrl: './student-list.scss',
})
export class StudentList {
  searchText = '';
  userData: any = [];
  columnDefination: ColDef[] = [];
  searchData: string;
  totalRecords: number = 0;
  paginationData: IPagination = { PageIndex: 1, PageSize: 10, SortColumn: '', SortOrder: '' };
  isLoading: boolean = false;
    ActiveStatus: number = 0;
  @ViewChild('searchInput') searchInputRef!: ElementRef;

  constructor(
    private router: Router,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private apiUrl: ApiUrlHelper,
    private commonService: CommonService,
    public auth: AuthService
  ) { }

  ngOnInit() {
    this.initializeColumnDefinitions();
    this.fetchUserList();
  }

  initializeColumnDefinitions(): void {
    this.columnDefination = [
      { headerName: 'adminId', field: 'adminId', hide: true },
      { headerName: 'userId', field: 'userId', hide: true },

      {
        headerName: 'Picture',
        field: 'imagedoc',
        minWidth: 100,
        resizable: false,
        cellRenderer: (params: ICellRendererParams) => {
          return `<img src="${params.value}" class="avatar" style="width: 40px; height: 40px; border-radius: 50%;" onerror="this.onerror=null;this.src='assets/images/NoImageUpload.png';">`;
        }
      },
      {
        headerName: 'First Name',
        maxWidth: 300,
        wrapText: false,
        resizable: false,
        field : 'firstName',
        colId: 'FirstName'
      },
      {
        headerName: 'Last Name',
        maxWidth: 300,
        wrapText: false,
        resizable: false,
        field : 'lastName',
        colId: 'LastName'
      },
      {
        headerName: 'Phone Number',
        minWidth: 200,
        resizable: false,
        field: 'phone',
        sortable:false
      },
      {
        headerName: 'Email', minWidth: 200, resizable: false, field: 'email',
        comparator: (valueA: string, valueB: string, nodeA: any, nodeB: any) => {
          const startA = new Date(nodeA.data.email).getTime();
          const startB = new Date(nodeB.data.email).getTime();
          return startA - startB; // proper date comparison
        }
      },
      {
        headerName: 'License Number',
        minWidth: 200,
        resizable: false,
        field: 'licenseNumber',
        sortable:false
      },
      
      {
        headerName: 'Signup Date',
        resizable: false,
        field: 'createdDate',
        minWidth: 200,
        valueFormatter: (params: any) => this.formatDate(params.value),
        comparator: (valueA: string, valueB: string, nodeA: any, nodeB: any) => {
          const startA = new Date(nodeA.data.createdDate).getTime();
          const startB = new Date(nodeB.data.createdDate).getTime();
          return startA - startB; // proper date comparison
        }
      },
      {
        headerName: 'Status',
        field: 'isActive',
        minWidth: 120,
        resizable: false,
       sortable: false,
        cellRenderer: (params: any) => {
          const user = params.data;
          if (this.auth.hasRight(MENU.STUDENT_MANAGEMENT, RIGHTS.EDIT)) {
            // Show clickable badge (looks like badge but acts like button)
            return `<span class="badge ${user.isActive ? 'bg-success' : 'bg-danger'} cursor-pointer">
                ${user.isActive ? 'Active' : 'Inactive'}
              </span>`;
          } else {
            // Show normal non-clickable badge
            return `<span class="badge ${user.isActive ? 'bg-success' : 'bg-danger'}">
                ${user.isActive ? 'Active' : 'Inactive'}
              </span>`;
          }
        },
        onCellClicked: (params: any) => {
          if (this.auth.hasRight(MENU.STUDENT_MANAGEMENT, RIGHTS.EDIT)) {
            const user = params.data;
            this.toggleSuspend(user.userId);
          }
        }
      },
      {
        headerName: 'Actions',
        resizable: false,
        sortable: false,
        cellRenderer: ActionButtonRenderer,
        cellRendererParams: (params: any) => {
          const user = params.data;
          const buttons: any[] = [];
          if (this.auth.hasRight(MENU.STUDENT_MANAGEMENT, RIGHTS.VIEW)) {
            buttons.push({ 
              img: 'assets/images/view.svg',   // or icon: 'fas fa-eye'
              alt: 'View',
              class: 'btn btn-link p-0 me-2',
              action: (user: any) => this.viewDetails(user.userId)
            
            });
          }


          return { containerClass: 'button-container', buttons };
        }
      }
    ];
  }

  toggleSuspend(userId: any) {
    const user = this.userData.find((u) => u.userId === userId);
    if (!user) return;

    const actionText = user.isActive ? 'InActivate' : 'Activate';

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you really want to ${actionText} this user?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, ${actionText} it!`
    }).then((result) => {
      if (result.isConfirmed) {
        this.callToggleApi(userId, user);
      }
    });
  }

  private callToggleApi(userId: any, user: any) {
    const apiUrl = this.apiUrl.apiUrl.Student.ActiveInActive;
    const data = { studentId: userId };
    this.spinner.show();

    this.commonService.doPost(apiUrl, data).subscribe({
      next: (response) => {
        this.spinner.hide();
        if (response.success) {
          user.isActive = !user.isActive;
          this.fetchUserList();
          this.toastr.success(response.message);
        } else {
          this.toastr.error(response.message);
        }
      },
      error: (err) => {
        this.spinner.hide();
        console.error('Error:', err);
      }
    });
  }

  viewPaymentHistory(studentId: any) {
    this.router.navigate(['/student-payment-history', this.commonService.Encrypt(studentId.toString())]);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();

    return `${month} ${day}, ${year}`;
  }

  onPaginationChanged(event: any) {
    this.paginationData = event;
    this.fetchUserList();
  }

  fetchUserList(): void {
    if (this.isLoading) return; // prevent multiple calls
    this.isLoading = true;
    const requestBody = {
      PageNumber: this.paginationData.PageIndex,
      PageSize: this.paginationData.PageSize,
      StrSearch: this.searchText,
      SortColumn: this.paginationData.SortColumn,
      SortOrder: this.paginationData.SortOrder,
      ActiveStatus : this.ActiveStatus
    };
    this.spinner.show();
    let apiUrl = this.apiUrl.apiUrl.Student.StudentList;
    this.commonService
      .doPost(apiUrl, requestBody)
      .pipe()
      .subscribe({
        next: (response) => {
          this.spinner.hide();
          this.isLoading = false;
          if (response.success && response.data) {
            this.userData = response.data;
          } else {
            this.userData = [];
          }
          setTimeout(() => {
            this.searchInputRef?.nativeElement?.focus();
          }, 0);
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error : ', err);
          this.spinner.hide();
          setTimeout(() => {
            this.searchInputRef?.nativeElement?.focus();
          }, 0);
        },
      });
  }

  onSearchTextChanged() {
    if (this.searchText.length >= 3 || this.searchText.length === 0) {
      this.paginationData.PageIndex = 1;
      this.fetchUserList();
    }
  }

  viewDetails(userId: any) {
    this.router.navigate(['/student/student-detail', this.commonService.Encrypt(userId.toString())]);
  }

  onSelectChange() {
    this.fetchUserList();
  }
}

