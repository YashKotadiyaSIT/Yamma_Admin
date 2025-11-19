import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiUrlHelper } from '../../../common/api-url-helper';
import { RegexPatterns } from '../../../common/Validation/Validation';
import { CommonService } from '../../../service/common/common.service';
import { StorageService, StorageKey } from '../../../service/storage/storage.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm: FormGroup;
  forgotPasswordForm: FormGroup;
  isForgotPassword: boolean = false;
  isOtpSent: boolean = false;
  phonenumber: string = '';
  resetPasswordForm: FormGroup;
  isOtpVerified: boolean = false;
  showPassword: boolean = true;
  isshowforgotpassword: boolean = true;
  isshowconfirmpassword: boolean = true;
  emailId: string = '';
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private apiUrl: ApiUrlHelper,
    private commonService: CommonService,
    private storageService: StorageService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(RegexPatterns.email)]],
      password: ['', [Validators.required]]
    });
    this.forgotPasswordForm = this.fb.group({
      emailid: ['', [Validators.required, Validators.pattern(RegexPatterns.email)]],
      otp: ['']
    });
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(15), Validators.pattern(/^\S{8,18}$/)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(15), Validators.pattern(/^\S{8,18}$/)]]
    });
  }

  onResetPassword() {
    if (this.resetPasswordForm.invalid) return;
    const newPassword = this.resetPasswordForm.get('newPassword')?.value;
    const confirmPassword = this.resetPasswordForm.get('confirmPassword')?.value;
    let apiUrl = this.apiUrl.apiUrl.Login.ResetPassword;
    const data = {
      token: this.storageService.getValue(StorageKey.authToken),
      NewPassword: newPassword,
      ConfirmPassword: confirmPassword
    };
    this.spinner.show();
    this.commonService
      .doPost(apiUrl, data)
      .pipe()
      .subscribe({
        next: (response) => {
          this.spinner.hide()
          if (response.success) {
            this.toastr.success(response.message);
            this.isForgotPassword = false;
            this.isOtpVerified = false;
            this.resetPasswordForm.reset();
            this.storageService.clearStorage();
          } else {
            this.toastr.error('Error!', response.message);
          }
        },
        error: (err) => {
          this.spinner.hide();
          this.toastr.error('Error!', err.message);
        },
      });
  }

  toggleForgotPassword() {
    this.isForgotPassword = !this.isForgotPassword;
    this.isOtpSent = false;
  }

  onLogin() {
    let apiUrl = this.apiUrl.apiUrl.Login.AdminLogin;
    let input = this.loginForm.get('email')?.value || '';
    const data = {
      emailId: input,
      Password: this.loginForm.get('password')?.value,
    };
    this.spinner.show();
    this.commonService
      .doPost(apiUrl, data)
      .pipe()
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.spinner.hide();
            this.storageService.setValue(StorageKey.authToken, response.data.token);
            this.storageService.setValue(StorageKey.phone, response.data.phone);
            this.router.navigate(['/dashboard']);
          } else {
            this.spinner.hide();
            this.toastr.error('Error!', response.message);
          }
        },
        error: (err) => {
          this.spinner.hide();
          this.toastr.error('Error!', err.message);
          localStorage.clear();
        },
      });
  }

  onGetOTP() {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched(); // force show errors
      return;
    }
    let apiUrl = this.apiUrl.apiUrl.Login.GetOtp;
    const emailId = this.forgotPasswordForm.get('emailid')?.value;
    if (!emailId) {
      this.toastr.error('Phone number is required');
      return;
    }
    const data = { emailId: emailId };
    this.spinner.show();
    this.commonService
      .doPost(apiUrl, data)
      .pipe()
      .subscribe({
        next: (response) => {
          this.spinner.hide()
          if (response.success) {
            this.isOtpSent = true;
            this.emailId = emailId;
            this.toastr.success(response.message);
          } else {
            this.spinner.hide();
            this.toastr.error('Error!', response.message);
          }
        },
        error: (err) => {
          this.spinner.hide();
          this.toastr.error('Error!', err.message);
        },
      });
  }

  onVerifyOTP() {
    const otp = this.forgotPasswordForm.get('otp')?.value;
    const data = { emailId: this.emailId, OTP: otp };
    let apiUrl = this.apiUrl.apiUrl.Login.VerifyOtp;
    this.spinner.show();
    this.commonService
      .doPost(apiUrl, data)
      .pipe()
      .subscribe({
        next: (response) => {
          this.spinner.hide();
          if (response.success) {
            this.isOtpVerified = true;
            this.storageService.setValue(StorageKey.authToken, response.data.token);
            this.storageService.setValue(StorageKey.phone, response.data.phone);
            this.toastr.success(response.message);
            this.forgotPasswordForm.reset();
          } else {
            this.toastr.error('Error!', response.message);
          }
        },
        error: (err) => {
          this.spinner.hide();
          this.toastr.error('Error!', err.message);
        },
      });
  }
}
