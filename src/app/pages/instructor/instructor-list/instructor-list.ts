import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { ApiUrlHelper } from '../../../common/api-url-helper';
import { MENU, RIGHTS } from '../../../common/Constants/EnumConstants';
import { IPagination } from '../../../interface/common-interface';
import { AuthService } from '../../../service/authService/auth.service';
import { CommonService } from '../../../service/common/common.service';
import { StorageService } from '../../../service/storage/storage.service';
import { ActionButtonRenderer } from '../../../component/action-button-renderer/action-button-renderer';
// import { CommonService } from '../../../service/common/common.service';

// import { EncryptionService } from 'src/app/service/EncryptionService/encryption.service';

@Component({
  selector: 'app-instructor-list',
  standalone: false,
  templateUrl: './instructor-list.html',
  styleUrl: './instructor-list.scss',
})
export class InstructorList {
  instructorData: any = [];
  columnDefination: ColDef[] = [];
  searchData: string;
  verificationStatus: number = 0;
  PaginationData: IPagination = {
    PageIndex: 1,
    PageSize: 10,
    SortColumn: '',
    SortOrder: ''
  };
  ActiveStatus: number = 0;

  isLoading: boolean = false;
  @ViewChild('searchInput') searchInputRef!: ElementRef;

  constructor(
    private spinner: NgxSpinnerService,
    private router: Router,
    private apiUrl: ApiUrlHelper,
    private commonService: CommonService,
    private storageService: StorageService,
    public auth: AuthService
  ) {
    this.verificationStatus = this.storageService.getVerificationStatus() == 0 ? 0 : this.storageService.getVerificationStatus();
    this.searchData = this.storageService.getSearchData();
    this.storageService.clearData();
  }

  ngOnInit() {
    this.columnDefination = [
      { headerName: 'instructorId', field: 'instructorId', hide: true },
      { headerName: 'userId', field: 'userId', hide: true },
      {
        headerName: 'Image',
        field: 'strImagedoc',
        resizable: false,
        cellRenderer: (params: ICellRendererParams) =>
          `<img class="avatar" src=${params.data.strImagedoc}  onerror="this.onerror=null;this.src='/assets/images/NoImageUpload.png';" />`
      },
      { headerName: 'First Name', field: 'firstName', resizable: false ,
        comparator: (valueA: string, valueB: string, nodeA: any, nodeB: any) => {
          const startA = new Date(nodeA.data.firstName).getTime();
          const startB = new Date(nodeB.data.firstName).getTime();
          return startA - startB; // proper date comparison
        }
      },
      {
        headerName: 'Last Name',
        field: 'lastName',
        resizable: false,
        minWidth: 100,
        cellStyle: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
        sortable: true,
        comparator: (valueA: string, valueB: string, nodeA: any, nodeB: any) => {
          const startA = new Date(nodeA.data.lastName).getTime();
          const startB = new Date(nodeB.data.lastName).getTime();
          return startA - startB; // proper date comparison
        }
      },
      {
        headerName: 'Phone Number',
        minWidth: 150,
        resizable: false,
        field: 'phoneno',
        sortable:true,
        colId: 'Phone',

      },
      {
        headerName: 'Email',
        field: 'email',
        resizable: false,
        minWidth: 300,
        cellStyle: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
        comparator: (valueA: string, valueB: string, nodeA: any, nodeB: any) => {
          const startA = new Date(nodeA.data.email).getTime();
          const startB = new Date(nodeB.data.email).getTime();
          return startA - startB; // proper date comparison
        }
      },

      {
        headerName: 'Vehicle Registration No',
        minWidth: 150,
        resizable: false,
        field: 'vehicleRegistrationNo',
        sortable:false,
      },

      {
        headerName: 'Status',
        field: 'isActive',
        minWidth: 120,
        resizable: false,
        sortable: false,
        cellRenderer: (params: any) => {
          const user = params.data;
          if (this.auth.hasRight(MENU.INSTRUCTOR_MANAGEMENT, RIGHTS.EDIT)) {
            return `<span class="badge ${user.isActive ? 'bg-success' : 'bg-danger'} cursor-pointer">
                ${user.isActive ? 'Active' : 'Inactive'}
              </span>`;
          } else {
            return `<span class="badge ${user.isActive ? 'bg-success' : 'bg-danger'}">
                ${user.isActive ? 'Active' : 'Inactive'}
              </span>`;
          }
        },
        onCellClicked: (params: any) => {
          if (this.auth.hasRight(MENU.INSTRUCTOR_MANAGEMENT, RIGHTS.EDIT)) {
            const user = params.data;
            this.toggleSuspend(user.userId);
          }
        }
      },
      {
        headerName: 'Verification Status',
        field: 'verificationStatus',
        resizable: false,
        sortable: false,
        cellRenderer: (params: any) => {
          const status = Number(params.data.verificationStatus); // Ensure numeri
          let badgeClass = '';
          let statusText = '';

          switch (status) {
            case 1: // Verified
              badgeClass = 'bg-success';
              statusText = 'Approved';
              break;
            case 2: // Pending
              badgeClass = 'bg-warning';
              statusText = 'Pending';
              break;
            case 3: // Rejected / Failed
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
        sortable: false,
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
            containerClass: 'button-container d-flex gap-2',
            buttons: btnAry
          };
        }

      }
    ];
    this.getinstructorData();
  }

  getinstructorData() {
    if (this.isLoading) return; // prevent multiple calls
    this.isLoading = true;
    let data = {
      PageNumber: this.PaginationData.PageIndex,
      PageSize: this.PaginationData.PageSize,
      StrSearch: this.searchData,
      SortColumn: this.PaginationData.SortColumn,
      SortOrder: this.PaginationData.SortOrder,
      verificationStatus: this.verificationStatus,
      ActiveStatus : this.ActiveStatus
    };

    let apiUrl = this.apiUrl.apiUrl.Instuctor.InstructorList;
    this.spinner.show();
    this.commonService
      .doPost(apiUrl, data)
      .pipe()
      .subscribe({
        next: (response) => {
          this.spinner.hide();
          this.isLoading = false;
          if (response.success) {
            this.instructorData = response.data;
          } else {
            this.instructorData = [];
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


    toggleSuspend(userId: any) {
      
        const user = this.instructorData.find((u) => u.userId === userId);
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
        const apiUrl = this.apiUrl.apiUrl.Instuctor.InstuctorActiveInActive;
        const data = { InstructorId: userId  , IsActive : user.isActive ? 0 : 1 };
        this.spinner.show();
    
        this.commonService.doPost(apiUrl, data).subscribe({
          next: (response) => {
            this.spinner.hide();
            if (response.success) {
              this.getinstructorData();
            } 
          },
          error: (err) => {
            this.spinner.hide();
            console.error('Error:', err);
          }
        });
      }

  onPaginationChanged(event: any) {
    this.PaginationData = event;
    this.getinstructorData();
  }

  onSelectChange() {
    this.getinstructorData();
  }

  onSearchtextChange() {
    if (this.searchData.length >= 3 || this.searchData.length === 0) {
      this.getinstructorData();
    }
  }

  onView(data: any) {
    this.storageService.setVerificationStatus(this.verificationStatus);
    this.storageService.setSearchData(this.searchData);
    this.router.navigate(['/instructor-profile', this.commonService.Encrypt(data.userId)]);
  }

  onEdit(data: any) {
    alert(`Editing details for ${data.name}`);
  }

  onDelete(data: any) {
    alert(`Deleting record for ${data.name}`);
  }
}
