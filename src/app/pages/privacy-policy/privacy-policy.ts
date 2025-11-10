import { Component } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiUrlHelper } from '../../common/api-url-helper';
import { CommonService } from '../../service/common/common.service';

@Component({
  selector: 'app-privacy-policy',
  standalone: false,
  templateUrl: './privacy-policy.html',
  styleUrl: './privacy-policy.scss',
})
export class PrivacyPolicy {
  privacyPolicyContent: string = '';
  constructor(private commonService: CommonService,
    private apiUrl: ApiUrlHelper,
    private spinner: NgxSpinnerService,) {

  }
   ngOnInit() {
    this.getPrivacyPolicyData();
  }

  getPrivacyPolicyData() {
    this.spinner.show();
    let apiUrl = this.apiUrl.apiUrl.setting.GetPrivacyPolicy;
    this.commonService.doGet(apiUrl).pipe().subscribe({
      next: (response) => {
        if (response.success) {
          this.spinner.hide();
          this.privacyPolicyContent = response.data[0].content;
        }
      },
      error: (err) => {
        this.spinner.hide();
        console.log(err);
      }
    });
  }
}
