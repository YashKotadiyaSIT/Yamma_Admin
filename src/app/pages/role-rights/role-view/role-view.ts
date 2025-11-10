import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiUrlHelper } from '../../../common/api-url-helper';
import { Menu, RoleRight } from '../../../models/role.model';
import { CommonService } from '../../../service/common/common.service';

@Component({
  selector: 'app-role-view',
  standalone: false,
  templateUrl: './role-view.html',
  styleUrl: './role-view.scss',
})
export class RoleView {
  @Input() roleId!: number;

  roleForm!: FormGroup;
  menus: Menu[] = [];
  roleRightList: RoleRight[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private apiUrl: ApiUrlHelper,
    private commonService: CommonService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.roleForm = this.fb.group({
      roleId: [null],
      roleName: [{ value: '', disabled: true }],
      rights: this.fb.array([])
    });

    if (this.roleId) {
      this.loadRoleData(this.roleId);
    }
  }

  get rightsArray(): FormArray {
    return this.roleForm.get('rights') as FormArray;
  }

  loadRoleData(roleId: number): void {
    const apiUrl = this.apiUrl.apiUrl.role.getRoleDetailsById.replace('{roleId}', roleId.toString());
    this.spinner.show();
    this.commonService.doGet(apiUrl).subscribe({
      next: (response) => {
        this.spinner.hide();
        if (response.success && response.data) {
          const roleData = response.data as { role: any, menuList: Menu[], roleRightList: RoleRight[] };

          this.roleForm.patchValue({
            roleId: roleData.role?.roleId,
            roleName: roleData.role?.roleName
          });

          this.menus = roleData.menuList || [];
          this.roleRightList = roleData.roleRightList || [];

          const accessibleMenuIds = this.roleRightList.map(r => r.menuId);
          this.menus = this.menus.filter(menu => accessibleMenuIds.includes(menu.menuId));

          this.buildForm(this.roleRightList);
        } else {
          this.toastr.error('Failed to load role details.');
          this.activeModal.dismiss();
        }
      },
      error: () => {
        this.spinner.hide();
        this.toastr.error('Something went wrong.');
        this.activeModal.dismiss();
      }
    });
  }

  buildForm(roleRights: RoleRight[]): void {
    this.rightsArray.clear();

    this.menus.forEach(menu => {
      const existing = roleRights.find(r => r.menuId === menu.menuId);

      const group = this.fb.group({
        roleRightId: [{ value: existing?.roleRightId || 0, disabled: true }],
        roleId: [{ value: this.roleId || 0, disabled: true }],
        menuId: [{ value: menu.menuId || 0, disabled: true }],
        menuName: [{ value: menu.menuName, disabled: true }],
        isView: [{ value: existing?.isView || menu.isDefault || false, disabled: true }],
        isAdd: [{ value: existing?.isAdd || menu.isDefault || false, disabled: true }],
        isEdit: [{ value: existing?.isEdit || menu.isDefault || false, disabled: true }],
        isDelete: [{ value: existing?.isDelete || menu.isDefault || false, disabled: true }],
        isApproveReject: [{ value: existing?.isApproveReject || menu.isDefault || false, disabled: true }]
      });

      this.rightsArray.push(group);
    });
  }

  dismissModal(): void {
    this.activeModal.dismiss('Cancelled');
  }
}
