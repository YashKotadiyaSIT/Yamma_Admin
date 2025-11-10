import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, AbstractControl } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiUrlHelper } from '../../../common/api-url-helper';
import { CommonConstants } from '../../../common/Constants/LabelConstants';
import { RegexPatterns } from '../../../common/Validation/Validation';
import { Menu, RoleRight } from '../../../models/role.model';
import { CommonService } from '../../../service/common/common.service';

@Component({
  selector: 'app-role-add-edit',
  standalone: false,
  templateUrl: './role-add-edit.html',
  styleUrl: './role-add-edit.scss',
})
export class RoleAddEdit {
  roleForm!: FormGroup;
  menus: Menu[] = [];
  roleRightList: RoleRight[] = [];
  initialRightsJson: string = '';
  CommonConstants: any = CommonConstants
  @Input() roleId: number | null = null;
  @Output() refreshGrid: EventEmitter<void> = new EventEmitter<void>();

  constructor(public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private apiUrl: ApiUrlHelper,
    private commonService: CommonService,
    private spinner: NgxSpinnerService,
    private toster: ToastrService
  ) { }

  ngOnInit() {
    this.roleForm = this.fb.group({
      roleId: [this.roleId || null],
      roleName: ['', [Validators.required, Validators.pattern(RegexPatterns.alphabetsWithSpace)]],
      rights: this.fb.array([])
    });

    this.loadRoleData(this.roleId);
  }

  get rightsArray() {
    return this.roleForm.get('rights') as FormArray;
  }

  loadRoleData(roleId: number | null): void {
    const apiUrl = this.apiUrl.apiUrl.role.getRoleDetailsById.replace('{roleId}', roleId?.toString() || '0');
    this.spinner.show();
    this.commonService.doGet(apiUrl).subscribe({
      next: (response) => {
        this.spinner.hide();
        if (response.success && response.data) {
          const roleData = response.data as { role: any, menuList: Menu[], roleRightList: RoleRight[]; };

          this.roleForm.patchValue({
            roleId: roleData.role?.roleId,
            roleName: roleData.role?.roleName
          });

          this.menus = roleData.menuList || [];
          this.roleRightList = roleData.roleRightList || [];
          this.buildForm(this.roleRightList);
          this.initialRightsJson = JSON.stringify(this.roleForm.getRawValue().rights);
        } else {
          this.toster.error('Failed to load role details.');
        }
      },
      error: () => {
        this.spinner.hide();
        this.toster.error('Something went wrong. Please try again later.');
      }
    });
  }

  buildForm(roleRights: RoleRight[]) {
    this.rightsArray.clear();

    this.menus.forEach(menu => {
      const existing = roleRights.find(r => r.menuId === menu.menuId);

      const group = this.fb.group({
        roleRightId: [existing?.roleRightId || 0],
        roleId: [this.roleId || 0],
        menuId: [menu.menuId || 0],
        menuName: [menu.menuName],
        isAll: [false],
        isView: [existing?.isView || menu.isDefault || false],
        isAdd: [existing?.isAdd || menu.isDefault || false],
        isEdit: [existing?.isEdit || menu.isDefault || false],
        isDelete: [existing?.isDelete || menu.isDefault || false],
        isApproveReject: [existing?.isApproveReject || menu.isDefault || false]
      });

      const individualRights = ['isView', 'isAdd', 'isEdit', 'isDelete', 'isApproveReject'];

      individualRights.forEach(ctrl => {
        group.get(ctrl)?.valueChanges.subscribe(() => {
          this.toggleViewDisable(group);
          this.checkMenuAllState(group, menu);
        });
      });

      group.get('isAll')?.valueChanges.subscribe((isChecked) => {
        this.toggleMenuRights(group, menu, isChecked);
      });

      this.toggleViewDisable(group);
      this.checkMenuAllState(group, menu);

      this.rightsArray.push(group);
    });

    this.initialRightsJson = JSON.stringify(this.roleForm.getRawValue().rights);
  }

  private getAvailableRights(menu: Menu): { controlName: string, allowProp: keyof Menu }[] {
    return [
      { controlName: 'isView', allowProp: 'allowView' as keyof Menu },
      { controlName: 'isAdd', allowProp: 'allowAdd' as keyof Menu },
      { controlName: 'isEdit', allowProp: 'allowEdit' as keyof Menu },
      { controlName: 'isDelete', allowProp: 'allowDelete' as keyof Menu },
      { controlName: 'isApproveReject', allowProp: 'allowApproveReject' as keyof Menu },
    ].filter(item => menu[item.allowProp]);
  }

  private toggleMenuRights(group: FormGroup, menu: Menu, isChecked: boolean): void {
    const availableRights = this.getAvailableRights(menu);

    availableRights.forEach(item => {
      const control = group.get(item.controlName);

      if (control) {
        if (item.controlName === 'isView' && control.disabled) {
          control.enable({ emitEvent: false });
        }

        control.setValue(isChecked, { emitEvent: false });
      }
    });

    this.toggleViewDisable(group);
    this.checkMenuAllState(group, menu);
  }

  private checkMenuAllState(group: FormGroup, menu: Menu): void {
    const availableRights = this.getAvailableRights(menu);

    if (availableRights.length === 0) {
      group.get('isAll')?.setValue(false, { emitEvent: false });
      return;
    }

    let allSelected = true;

    availableRights.forEach(item => {
      const isChecked = group.getRawValue()[item.controlName];

      if (!isChecked) {
        allSelected = false;
      }
    });

    group.get('isAll')?.setValue(allSelected, { emitEvent: false });
  }

  private toggleViewDisable(group: FormGroup) {
    const otherRights = ['isAdd', 'isEdit', 'isDelete', 'isApproveReject'];
    const hasOtherRights = otherRights.some(r => group.getRawValue()[r]);

    if (hasOtherRights) {
      group.get('isView')?.setValue(true, { emitEvent: false });
      group.get('isView')?.disable({ emitEvent: false });
    } else {
      group.get('isView')?.enable({ emitEvent: false });
    }
  }

  saveRole() {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    const rightsBeforeSubmission = this.roleForm.getRawValue().rights;

    this.rightsArray.controls.forEach(control => {
      const formGroup = control as FormGroup;
      formGroup.get('isView')?.enable({ emitEvent: false });
      formGroup.removeControl('isAll', { emitEvent: false });
    });

    const currentRights = this.roleForm.getRawValue().rights;
    const currentRightsJson = JSON.stringify(currentRights);

    let hasRightsChanged: boolean = false;
    if (this.initialRightsJson != currentRightsJson && this.roleId) {
      hasRightsChanged = true;
    }

    const payload = {
      roleId: this.roleForm.value.roleId ?? 0,
      roleName: this.roleForm.value.roleName.trim(),
      rightsJson: currentRightsJson,
      hasRightsChanged: hasRightsChanged
    };

    const apiUrl = this.apiUrl.apiUrl.role.addUpdateRole;
    this.spinner.show();
    this.commonService.doPost(apiUrl, payload).subscribe({
      next: (response: any) => {
        this.spinner.hide();
        if (response.success) {
          this.toster.success(response.message || "Role saved successfully.");
          this.activeModal.close(response);
          this.refreshGrid.emit();
        } else {
          this.revertFormState(rightsBeforeSubmission);
          this.toster.error(response.message || "Failed to save role. Please try again later.");
        }
      },
      error: (err) => {
        this.spinner.hide();
        this.revertFormState(rightsBeforeSubmission);
        this.toster.error("Failed to save role. Please try again later.");
      }
    });
  }

  private revertFormState(previousRights: any[]): void {
    this.rightsArray.controls.forEach((control: AbstractControl, i: number) => {
      const formGroup = control as FormGroup;
      const menu = this.menus[i];

      formGroup.addControl('isAll', this.fb.control(false), { emitEvent: false });

      formGroup.patchValue(previousRights[i], { emitEvent: false });

      formGroup.get('isAll')?.valueChanges.subscribe((isChecked) => {
        this.toggleMenuRights(formGroup, menu, isChecked);
      });

      this.toggleViewDisable(formGroup);
      this.checkMenuAllState(formGroup, menu);
    });
  }


  dismissModal() {
    this.activeModal.dismiss('Cancelled');
  }
}
