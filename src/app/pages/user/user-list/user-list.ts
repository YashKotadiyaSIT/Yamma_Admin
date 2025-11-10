import { Component, ElementRef, ViewChild } from '@angular/core';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { IPagination } from '../../../interface/common-interface';
import { MENU, RIGHTS } from '../../../common/Constants/EnumConstants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { ApiUrlHelper } from '../../../common/api-url-helper';
import { ErrorMessageConstants } from '../../../common/Constants/LabelConstants';
import { AuthService } from '../../../service/authService/auth.service';
import { CommonService } from '../../../service/common/common.service';
import { UserAddedit } from '../user-addedit/user-addedit';
import { ActionButtonRenderer } from '../../../component/action-button-renderer/action-button-renderer';

@Component({
  selector: 'app-user-list',
  standalone: false,
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
})
export class UserList {
  userList: any[] = [];
  columnDefination: ColDef[] = [];
  totalRecords: number = 0;
  paginationData: IPagination = { PageIndex: 1, PageSize: 10, SortColumn: '', SortOrder: '' };
  searchText: string = '';
  isLoading: boolean = false;
  MENU = MENU;
  RIGHTS = RIGHTS;
  loginUserId : Number = 0;

  @ViewChild('searchInput') searchInputRef!: ElementRef;

  constructor(
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private apiUrl: ApiUrlHelper,
    private commonService: CommonService,
    public auth: AuthService
  ) {this.loginUserId =  this.auth.getLoginUserId()}

  

  ngOnInit() {
    this.initializeColumnDefinitions();
    this.fetchUserList();
  }

  initializeColumnDefinitions(): void {
    this.columnDefination = [
      { headerName: 'UserId', field: 'userId', hide: true },
      {
        headerName: 'Picture',
        field: 'profilePicture',
        minWidth: 100,
        resizable: false,
        cellRenderer: (params: ICellRendererParams) => {
          return `<img src="${params.value}" class="avatar" style="width: 40px; height: 40px; border-radius: 50%;padding:5px" onerror="this.onerror=null;this.src='../../../../assets/images/NoImageUpload.png';">`;
        }
      },
      {
        headerName: 'Name',
        minWidth: 200,
        wrapText: false,
        resizable: false,
        valueGetter: (params: any) => `${params.data.firstName} ${params.data.lastName}`,
        colId: 'Name'
      },
      {
        headerName: 'Role',
        minWidth: 200,
        wrapText: false,
        resizable: false,
        valueGetter: (params: any) => `${params.data.roleName}`,
        colId: 'Role'
      },
      {
        headerName: 'Phone Number',
        minWidth: 200,
        resizable: false,
        valueGetter: (params: any) => `+44 ${params.data.phoneNo} `,
        colId: 'PhoneNo'
      },
      {
        headerName: 'Email',
        minWidth: 300,
        resizable: false,
        field: 'emailId',
        colId: 'EmailId'
      },


      
      {
        headerName: 'Actions',
        resizable: false,
        minWidth: 300,
        cellRenderer: ActionButtonRenderer,
        cellRendererParams: (params: any) => {
          const user = params.data;
          const buttons: any[] = [];

          // Edit button with SVG icon

          if (this.auth.hasRight(MENU.USER_MANAGEMENT, RIGHTS.VIEW)) {
            buttons.push({
              img: 'assets/images/view.svg',   // or icon: 'fas fa-eye'
              alt: 'View',
              class: 'btn btn-link p-0 me-2',
              action: (data: any) => this.openViewRole(data.userId)
            });
          }

          if (user.isEditable && this.auth.hasRight(MENU.USER_MANAGEMENT, RIGHTS.EDIT) && user.userId != this.loginUserId) {
            buttons.push({
              img: 'assets/images/edit.svg',
              alt: 'Edit',
              class: 'btn btn-link p-0 me-2',
              action: (user: any) => this.onAddUpdateUser(user.userId),
            });
          }

          // Delete button with SVG icon
          if (user.isEditable && this.auth.hasRight(MENU.USER_MANAGEMENT, RIGHTS.DELETE) && user.userId != this.loginUserId) {
            buttons.push({
              img: 'assets/images/delete.svg',
              alt: 'Delete',
              class: 'btn btn-link p-0',
              action: (user: any) => this.onDeleteUser(user.userId),
            });
          }

          return { containerClass: 'button-container d-flex gap-2', buttons };
        },

        sortable: false
      }
    ];
  }

  toggleSuspend(userId: any) {
    const user = this.userList.find((u) => u.userId === userId);
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

  onDeleteUser(userId: number) {
    Swal.fire({
      title: 'Are you sure you want to delete User?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        let apiUrl = this.apiUrl.apiUrl.user.deleteUser.replace('{id}', userId.toString());

        this.commonService.doDelete(apiUrl, {}).subscribe({
          next: (response: any) => {
            if (response.success) {
               this.toastr.success('Deleted!')
               this.fetchUserList();
            } else {
               this.toastr.error(response.message);            }
          },
          error: (err) => {
          this.toastr.error(ErrorMessageConstants.CouponFailed);          }
        });
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  }

  onAddUpdateUser(userId: number) {
    const modalRef = this.modalService.open(UserAddedit, {
      size: 'lg',
      centered: true,
      backdrop: 'static'
    });

    modalRef.componentInstance.userId = userId || 0; // Default to 0 if userId is not provided
    modalRef.componentInstance.isView = false; 

    modalRef.componentInstance.refreshGrid.subscribe(() => {
      this.fetchUserList();
    });

    modalRef.result.then(
      (result) => {
      },
      (reason) => {
      }
    );
  }

  fetchUserList() {
    if (this.isLoading) return; // prevent multiple calls
    this.isLoading = true;

    const requestBody = {
      PageNumber: this.paginationData.PageIndex,
      PageSize: this.paginationData.PageSize,
      StrSearch: this.searchText,
      SortColumn: this.paginationData.SortColumn,
      SortOrder: this.paginationData.SortOrder
    };
    this.spinner.show();
    let apiUrl = this.apiUrl.apiUrl.user.getUserList;

    this.commonService
      .doPost(apiUrl, requestBody)
      .pipe()
      .subscribe({
        next: (response) => {
          this.spinner.hide();
          this.isLoading = false;
          if (response.success) {
            this.userList = Array.isArray(response.data) ? response.data : [];
          } else {
            this.userList = [];
            this.spinner.hide();
            console.error('No coupon found or error occurred', response.message);
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

  private callToggleApi(userId: any, user: any) {
    const apiUrl = this.apiUrl.apiUrl.user.activeInactiveUser;
    const data = { userId: userId };
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

  onSearchTextChanged() {
    if (this.searchText.length >= 3 || this.searchText.length === 0) {
      this.paginationData.PageIndex = 1;
      this.fetchUserList();
    }
  }
  onPaginationChanged(event: any) {
    this.paginationData = event;
    this.fetchUserList();
  }

   openViewRole(userid: number): void {
      const modalRef = this.modalService.open(UserAddedit, {
        size: 'lg', 
        centered: true,
        backdrop: 'static'
      });
      modalRef.componentInstance.userId = userid;
      modalRef.componentInstance.isView = true; 
    }
}
