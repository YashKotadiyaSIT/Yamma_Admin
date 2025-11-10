import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiUrlHelper } from '../../../common/api-url-helper';
import { MENU, RIGHTS } from '../../../common/Constants/EnumConstants';
import { SettingConstants } from '../../../common/Constants/LabelConstants';
import { AuthService } from '../../../service/authService/auth.service';
import { CommonService } from '../../../service/common/common.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-privacy-policy',
  standalone: false,
  templateUrl: './privacy-policy.html',
  styleUrl: './privacy-policy.scss',
})
export class PrivacyPolicy {
  public PrivacyPolicyForm: FormGroup;
  public LabelConstants = SettingConstants;
  editRights: boolean = false;

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: 'auto',
    minHeight: '0',
    maxHeight: 'auto',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    placeholder: 'Enter text here...',
    defaultParagraphSeparator: '',
    defaultFontName: '',
    defaultFontSize: '',
    fonts: [
      { class: 'arial', name: 'Arial' },
      { class: 'times-new-roman', name: 'Times New Roman' },
      { class: 'calibri', name: 'Calibri' },
      { class: 'comic-sans-ms', name: 'Comic Sans MS' }
    ],
    customClasses: [
      {
        name: 'quote',
        class: 'quote'
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1'
      }
    ],
    uploadUrl: 'v1/image',
    uploadWithCredentials: false,
    sanitize: true,
    toolbarPosition: 'top',
    toolbarHiddenButtons: [['bold', 'italic'], ['fontSize']]
  };

  constructor(private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private commonService: CommonService,
    private apiUrl: ApiUrlHelper,
    private toster: ToastrService,
    private auth: AuthService
  ) {
    this.PrivacyPolicyForm = this.fb.group({
      PrivacyPolicy: ['']
    });

    this.editRights = this.auth.hasRight(MENU.SETTING, RIGHTS.EDIT);
  }

  ngOnInit() {
    this.getPrivacyPolicyData();
  }

  submitPrivacyForm() {
    if (this.PrivacyPolicyForm.valid) {
      let api = this.apiUrl.apiUrl.setting.UpdatePrivacyPolicy;
      let AddPolicyModel = {
        PrivacyPageId: 1,
        Content: this.PrivacyPolicyForm.value.PrivacyPolicy?.trim(),
      };
      this.spinner.show();
      this.commonService.doPost(api, AddPolicyModel).pipe().subscribe({
        next: (response) => {
          if (response.success) {
            this.getPrivacyPolicyData();
            this.toster.success(response.message);
            this.spinner.hide();
          } else {
            this.spinner.hide();
            this.toster.error(response.message);
            this.getPrivacyPolicyData();
          }
        },
        error: (err) => {
          this.spinner.hide();
          console.log(err);
        }
      });
    }
  }

  getPrivacyPolicyData() {
    let apiUrl = this.apiUrl.apiUrl.setting.GetPrivacyPolicy;
    this.commonService.doGet(apiUrl).pipe().subscribe({
      next: (response) => {
        if (response.success) {
          this.PrivacyPolicyForm.patchValue({
            PrivacyPolicy: response.data[0].content,
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
