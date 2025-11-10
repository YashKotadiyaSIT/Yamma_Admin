import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColDef } from 'ag-grid-community';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { ApiUrlHelper } from '../../../common/api-url-helper';
import { MENU, RIGHTS } from '../../../common/Constants/EnumConstants';
import { ErrorMessageConstants } from '../../../common/Constants/LabelConstants';
import { IPagination } from '../../../interface/common-interface';
import { AuthService } from '../../../service/authService/auth.service';
import { CommonService } from '../../../service/common/common.service';
import { RoleView } from '../role-view/role-view';
import { ActionButtonRenderer } from '../../../component/action-button-renderer/action-button-renderer';
import { RoleAddEdit } from '../role-add-edit/role-add-edit';

@Component({
  selector: 'app-role-list',
  standalone: false,
  templateUrl: './role-list.html',
  styleUrl: './role-list.scss',
})
export class RoleList {
  roleList: any[] = [];
  columnDefination: ColDef[] = [];
  totalRecords: number = 0;
  paginationData: IPagination = { PageIndex: 1, PageSize: 10, SortColumn: '', SortOrder: '' };
  searchText: string = '';
  isLoading: boolean = false;
  MENU = MENU;
  RIGHTS = RIGHTS;
  RoleID: any;
  @ViewChild('searchInput') searchInputRef!: ElementRef;

  constructor(
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private apiUrl: ApiUrlHelper,
    private commonService: CommonService,
    public auth: AuthService
  ) {
    this.RoleID = this.auth.getRoleId();
  }

  ngOnInit() {
    this.initializeColumnDefinitions();
    this.fetchRoleList();
  }

  initializeColumnDefinitions(): void {
    this.columnDefination = [
      { headerName: 'RoleId', field: 'roleId', hide: true },
      {
        headerName: 'Name',
        field: 'roleName',
        minWidth: 350,
        resizable: false
      },
      {
        headerName: 'Actions',
        resizable: false,
        width: 500,
        pinned: 'right',
        suppressMovable: true,
        sortable: false,
        cellRenderer: ActionButtonRenderer,
        cellRendererParams: (params: any) => {
          const role = params.data;
          const buttons: any[] = [];

          if (this.auth.hasRight(MENU.ROLE_MANAGEMENT, RIGHTS.VIEW)) {
            buttons.push({
              img: 'assets/images/view.svg',
              alt: 'View',
              class: 'btn btn-link p-0 me-2',
              action: (role: any) => this.openViewRole(role.roleId),
            });
          }
          // Edit button
          if (role.roleId != this.RoleID && role.isEditable && this.auth.hasRight(MENU.ROLE_MANAGEMENT, RIGHTS.EDIT)) {
            buttons.push({
              img: 'assets/images/edit.svg',
              alt: 'Edit',
              class: 'btn btn-link p-0 me-2',
              action: (role: any) => this.onAddUpdateRole(role.roleId),
            });
          }

          // Delete button
          if (role.roleId != this.RoleID && role.isEditable && this.auth.hasRight(MENU.ROLE_MANAGEMENT, RIGHTS.DELETE)) {
            buttons.push({
              img: 'assets/images/delete.svg',
              alt: 'Delete',
              class: 'btn btn-link p-0',
              action: (role: any) => this.onDeleteRole(role.roleId),
            });
          }



          return { containerClass: 'button-container', buttons };
        }
      }
    ];
  }

  onAddUpdateRole(roleId: number) {
    const modalRef = this.modalService.open(RoleAddEdit, {
      size: 'lg',
      centered: true,
      backdrop: 'static'
    });

    modalRef.componentInstance.roleId = roleId || 0;

    modalRef.componentInstance.refreshGrid.subscribe(() => {
      this.fetchRoleList();
    });

    modalRef.result.then(
      (result) => { },
      (reason) => { }
    );
  }

  openViewRole(roleId: number): void {
    const modalRef = this.modalService.open(RoleView, {
      size: 'lg',
      centered: true,
      backdrop: 'static'
    });
    modalRef.componentInstance.roleId = roleId;

  }

  onDeleteRole(roleId: number) {
    Swal.fire({
      title: 'Are you sure you want to delete Role?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        let apiUrl = this.apiUrl.apiUrl.role.deleteRole.replace('{id}', roleId.toString());

        this.commonService.doDelete(apiUrl, {}).subscribe({
          next: (response: any) => {
            this.spinner.hide();
            if (response.success) {
              this.toastr.success('Deleted!')
              this.fetchRoleList();
            } else {
              this.toastr.error(response.message);
            }
          },
          error: () => {
            this.spinner.hide();
            this.toastr.error(ErrorMessageConstants.CouponFailed);
          }
        });
      }
    });
  }

  fetchRoleList() {
    if (this.isLoading) return;
    this.isLoading = true;

    const requestBody = {
      PageNumber: this.paginationData.PageIndex,
      PageSize: this.paginationData.PageSize,
      StrSearch: this.searchText,
      SortColumn: this.paginationData.SortColumn,
      SortOrder: this.paginationData.SortOrder
    };

    this.spinner.show();
    let apiUrl = this.apiUrl.apiUrl.role.getRoleList;

    this.commonService.doPost(apiUrl, requestBody).subscribe({
      next: (response) => {
        this.spinner.hide();
        this.isLoading = false;
        if (response.success) {
          this.roleList = Array.isArray(response.data) ? response.data : [];
        } else {
          this.roleList = [];
        }
        setTimeout(() => {
          this.searchInputRef?.nativeElement?.focus();
        }, 0);
      },
      error: (err) => {
        this.isLoading = false;
        this.spinner.hide();
        this.toastr.error(ErrorMessageConstants.Message);
      },
    });
  }

  onSearchTextChanged() {
    if (this.searchText.length >= 3 || this.searchText.length === 0) {
      this.paginationData.PageIndex = 1;
      this.fetchRoleList();
    }
  }

  onPaginationChanged(event: any) {
    this.paginationData = event;
    this.fetchRoleList();
  }
}
