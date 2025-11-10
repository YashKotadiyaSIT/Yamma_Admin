import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiUrlHelper } from '../../../common/api-url-helper';
import { AuthService } from '../../../service/authService/auth.service';
import { CommonService } from '../../../service/common/common.service';
import { MENU, RIGHTS } from '../../../common/Constants/EnumConstants';
import { SettingConstants } from '../../../common/Constants/LabelConstants';

@Component({
  selector: 'app-commission-management',
  standalone: false,
  templateUrl: './commission-management.html',
  styleUrl: './commission-management.scss',
})
export class CommissionManagement {
  CommissionForm: FormGroup;
  ReferralForm: FormGroup;
  editRights: boolean = false;
  public LabelConstants = SettingConstants

  constructor(private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private commonService: CommonService,
    private apiUrl: ApiUrlHelper,
    private toster: ToastrService,
    private auth: AuthService
  ) {

    this.CommissionForm = this.fb.group({
      Commission: [null, [Validators.required, Validators.min(15), Validators.max(100)]]
    });

    this.ReferralForm = this.fb.group({
      ReferralCodeAmount: ['', [Validators.required, Validators.min(1), Validators.max(500)]]
    });

    this.editRights = this.auth.hasRight(MENU.SETTING, RIGHTS.EDIT);
  }

  ngOnInit() {
    this.getCommissionAndReferralData();
  }

  submitCommissionForm() {
    if (this.CommissionForm.valid) {
      const commissionValue = this.CommissionForm.value.Commission;
      this.UpdateCommissionReferralCode();
    }
  }

  submitReferralForm() {
    if (this.ReferralForm.valid) {
      this.UpdateCommissionReferralCode();
    }
  }

  UpdateCommissionReferralCode() {
    let api = this.apiUrl.apiUrl.setting.UpdateCommissionRefferalCode;
    let body = {
      CommissionPercentage: this.CommissionForm.controls['Commission'].value,
      ReferralCodeAmount: this.ReferralForm.controls['ReferralCodeAmount'].value,
    };
    this.spinner.show();
    this.commonService.doPost(api, body).pipe().subscribe({
      next: (response) => {
        this.spinner.hide();
        if (response.success) {
          this.toster.success(response.message);
        } else {
          this.toster.error(response.message);
        }
        this.getCommissionAndReferralData();
      },
      error: (err) => {
        this.spinner.hide();
        console.log(err);
      }
    });
  }

  getCommissionAndReferralData() {
    let apiUrl = this.apiUrl.apiUrl.setting.GetCommissionRefferalCode;
    this.commonService.doGet(apiUrl).pipe().subscribe({
      next: (response) => {
        if (response.success) {
          this.CommissionForm.patchValue({
            Commission: response.data?.commissionPercentage,
          });
          this.ReferralForm.patchValue({
            ReferralCodeAmount: response.data?.referralCodeAmount,
          });
        }
      },
      error: (err) => {
        this.spinner.hide();
        console.log(err);
      }
    });
  }
}
