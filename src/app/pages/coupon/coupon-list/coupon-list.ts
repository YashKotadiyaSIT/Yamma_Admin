import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { ApiUrlHelper } from '../../../common/api-url-helper';
import { MENU, RIGHTS, CouponColor } from '../../../common/Constants/EnumConstants';
import { ErrorMessageConstants } from '../../../common/Constants/LabelConstants';
import { IPagination } from '../../../interface/common-interface';
import { AuthService } from '../../../service/authService/auth.service';
import { CommonService } from '../../../service/common/common.service';
import { ActionButtonRenderer } from '../../../component/action-button-renderer/action-button-renderer';
import { CouponAddedit } from '../coupon-addedit/coupon-addedit';

@Component({
  selector: 'app-coupon-list',
  standalone: false,
  templateUrl: './coupon-list.html',
  styleUrl: './coupon-list.scss',
})
export class CouponList {
  couponList: any[] = [];
  columnDefination: ColDef[] = [];
  totalRecords: number = 0;
  paginationData: IPagination = { PageIndex: 1, PageSize: 10, SortColumn: '', SortOrder: '' };
  searchText: string = '';
  isLoading: boolean = false;
  MENU = MENU;
  RIGHTS = RIGHTS;
  ActiveStatus: number = 0;
  @ViewChild('searchInput') searchInputRef!: ElementRef;

  constructor(
    private router: Router,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private apiUrl: ApiUrlHelper,
    private commonService: CommonService,
    public auth: AuthService
  ) { }

  ngOnInit() {
    this.initializeColumnDefinitions();
    this.fetchCouponList();
  }
  initializeColumnDefinitions(): void {
    this.columnDefination = [
      { headerName: 'CouponId', field: 'couponId', hide: true },
      { headerName: 'UserId', field: 'userId', hide: true },
   
      {
        headerName: 'Coupon Title',
        field: 'couponTitle',
        minWidth: 200,
        resizable: false,
         cellClass: 'custom-coupon-title',
        cellRenderer: (params: ICellRendererParams) => {
          return `<div class="box-title" style="border-left: 6px solid #${params.data.couponColorName};"><div style="margin-left:10px;display:block;width:200px;">${params.data.couponTitle}</div></div>`;
        }
      },

      {
        headerName: 'Coupon Code',
        field: 'couponCode',
        resizable: false,
        minWidth: 200,
        
      },

      {
        headerName: 'Price',
        field: 'amount',
        resizable: false,
        valueFormatter: (params: any) => `${params.value.toFixed(2)}`,
        sortable: false
      },
      {
        headerName: 'Percentage',
        field: 'percentage',
        resizable: false,
        sortable: false
      },
      {
        headerName: 'Valid Date',
        field: 'dateRange',
        resizable: false,
        valueGetter: (params: any) => {
          const startDate = params.data.startDate ? this.formatDate(params.data.startDate) : '';
          const expiryDate = params.data.expiryDate ? this.formatDate(params.data.expiryDate) : '';
          return `${startDate} to ${expiryDate}`;
        },
        colId: 'StartDate',
        sortable: true,
        comparator: (valueA: string, valueB: string, nodeA: any, nodeB: any) => {
          const startA = new Date(nodeA.data.startDate).getTime();
          const startB = new Date(nodeB.data.startDate).getTime();
          return startA - startB; // proper date comparison
        }
      },
      {
        headerName: 'Minimum Amount',
        field: 'minAmount',
        resizable: false,
        minWidth: 50,
        valueFormatter: (params: any) => `${params.value.toFixed(2)}`,
        sortable: false
      },
      {
        headerName: 'Usage',
         maxWidth: 200,
        valueGetter: (params: any) => `${params.data.usedCount} / ${params.data.maxUsageLimit}`,
        resizable: false,
        sortable: false
      },
       {
        headerName: 'Status',
        field: 'isActive',
        minWidth: 120,
        resizable: false,
        sortable: false,
        cellRenderer: (params: any) => {
          const user = params.data;
          if (this.auth.hasRight(MENU.COUPON_MANAGEMENT, RIGHTS.EDIT)) {
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
            this.AcitveInActiveCoupon(user.couponId);
          }
        }
      },

      {
        headerName: 'Actions',
        resizable: false,
        cellRenderer: ActionButtonRenderer,
        cellRendererParams: (params: any) => {
          const coupon = params.data;
          const buttons: any[] = [];

          // conditionally add Edit button
          if (this.auth.hasRight(MENU.COUPON_MANAGEMENT, RIGHTS.EDIT)) {
            buttons.push({
              img: 'assets/images/edit.svg',
              alt: 'Edit',
              class: 'btn btn-link p-0 me-2',
              action: (user: any) => this.onAddUpdateCoupon(coupon.couponId),
            });
       
          }

          // Delete button
          if (this.auth.hasRight(MENU.COUPON_MANAGEMENT, RIGHTS.DELETE)) {
            buttons.push({
            img: 'assets/images/delete.svg',
            alt: 'Delete',
            class: 'btn btn-link p-0',
            action: (user: any) => this.onDeleteCoupon(coupon.couponId),
          });
        
          }

          return { containerClass: 'button-container', buttons };
        },
        sortable: false
      }
    ];
  }

  viewDetails(coupon: any) {
    if (!coupon || !coupon.couponId) {
      console.error('Invalid coupon or couponId:', coupon);
      return;
    }

    try {

      this.router.navigate(['/coupon-view', this.commonService.Encrypt(coupon.couponId.toString())]);
    } catch (error) {
      console.error('Error during encryption:', error);
    }
  }


  onDeleteCoupon(couponId: string) {
    Swal.fire({
      title: 'Are you sure you want to delete Coupon?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        let apiUrl = this.apiUrl.apiUrl.coupon.DeleteCoupon.replace('{id}', couponId);

        this.commonService.doDelete(apiUrl, {}).subscribe({
          next: (response: any) => {
            if (response.success) {
              this.toastr.success('Deleted!')
              this.fetchCouponList();
            } else {
              this.toastr.error(response.message);
            }
          },
          error: (err) => {
           this.toastr.error(ErrorMessageConstants.CouponFailed);
          }
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

  onAddUpdateCoupon(couponId: number) {
    const modalRef = this.modalService.open(CouponAddedit, {
      size: 'lg',
      centered: true,
      backdrop: 'static'
    });

    modalRef.componentInstance.couponId = couponId || 0; // Default to 0 if couponId is not provided

    modalRef.componentInstance.refreshGrid.subscribe(() => {
      this.fetchCouponList();
    });

    modalRef.result.then(
      (result) => {
      },
      (reason) => {
      }
    );
  }

  fetchCouponList() {
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
    let apiUrl = this.apiUrl.apiUrl.coupon.GetCouponList;

    this.commonService
      .doPost(apiUrl, requestBody)
      .pipe()
      .subscribe({
        next: (response) => {
          this.spinner.hide();
          this.isLoading = false;
          if (response.success) {
            this.couponList = Array.isArray(response.data)
              ? response.data.map((coupon: any) => ({
                ...coupon,
                couponColorName: this.getCouponColorName(coupon.couponColor)
              }))
              : [];
          } else {
            this.couponList = [];
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

  onSearchTextChanged() {
    if (this.searchText.length >= 3 || this.searchText.length === 0) {
      this.paginationData.PageIndex = 1;
      this.fetchCouponList();
    }
  }
  onPaginationChanged(event: any) {
    this.paginationData = event;
    this.fetchCouponList();
  }

  getCouponColorName(code: string): string {
    const entry = Object.entries(CouponColor).find(([name, value]) => value === code);
    return entry ? entry[0] : code; // return the color name or fallback to the code
  }

  AcitveInActiveCoupon(CouponId: any) {
    
    const coupon = this.couponList.find((u) => u.couponId === CouponId);
    if (!coupon) return;

    const actionText = coupon.isActive ? 'InActivate' : 'Activate';

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you really want to ${actionText} this coupon?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, ${actionText} it!`
    }).then((result) => {
      if (result.isConfirmed) {
        this.callToggleApi(coupon);
      }
    });
  }

  private callToggleApi(coupondetail: any) {
    const apiUrl = this.apiUrl.apiUrl.coupon.ActiveInactiveCoupon;
    const data = { CouponId: coupondetail.couponId, CouponStatus: coupondetail.isActive ? 0 : 1 };
    this.spinner.show();

    this.commonService.doPost(apiUrl, data).subscribe({
      next: (response) => {
        this.spinner.hide();
        if (response.success) {
          this.fetchCouponList();
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

  onSelectChange() {
    this.fetchCouponList();
  }
}
