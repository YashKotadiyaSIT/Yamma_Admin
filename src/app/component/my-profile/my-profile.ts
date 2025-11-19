import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiUrlHelper } from '../../common/api-url-helper';
import { ErrorMessageConstants } from '../../common/Constants/LabelConstants';
import { CommonService } from '../../service/common/common.service';
import { ProfileService } from '../../service/Shared/profile.service';

@Component({
  selector: 'app-my-profile',
  standalone: false,
  templateUrl: './my-profile.html',
  styleUrl: './my-profile.scss',
})
export class MyProfile {
  passwordForm: FormGroup;
  errorMessage: string = '';
  profileImage: string | null = null;
  fileToUpload: File | null = null;
  userId: string | null = null; 
  isshowoldpwd: boolean = true;
  isshownewpwd: boolean = true;
  isshowconfirmpwd: boolean = true;
  profileForm!: FormGroup;
  defualtImagePath:any='https://via.placeholder.com/200';
  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private apiUrl: ApiUrlHelper,
    private commonService: CommonService,
    private profileService: ProfileService
  ) {
    this.passwordForm = this.fb.group(
      {
        oldPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(15)]],
        newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(15)]],
        confirmPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(15)]]
      },
      {
        validators: this.confirmedValidator
      }
    );
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9 ]+$/), Validators.maxLength(30)]],
      lastName: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9 ]+$/), Validators.maxLength(30)]],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      phone: [ '',  [Validators.required, Validators.pattern(/^[0-9]{10,13}$/)]],
      role:[{ value: '', disabled: true }]
    });
  }
  confirmedValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { confirmedValidator: true };
  }
  ngOnInit(): void {
    this.fetchAdminDetails();
  }
  fetchAdminDetails() {
    let apiUrl = this.apiUrl.apiUrl.Login.ProfilePicture;
    this.spinner.show();
    this.commonService.doGet(apiUrl).pipe().subscribe({
      next: (response) => {
        this.spinner.hide();
        if (response.success) {
          if (response.data) {
            this.profileForm.controls['firstName'].setValue(response.data.firstName);
            this.profileForm.controls['lastName'].setValue(response.data.lastName);
            this.profileForm.controls['email'].setValue(response.data.email);
            this.profileForm.controls['phone'].setValue(response.data.phone);
            this.profileForm.controls['role'].setValue(response.data.roleName);
            if (response.data.firstName|| response.data.lastName|| response.data.profilePicture) {
              this.profileImage = response.data?.profilePicture || this.defualtImagePath;
              let profileDetails = { firstName: response.data.firstName || '', lastName: response.data.lastName, profileImage: this.profileImage || '' };
              this.profileService.setProfileImage(profileDetails);
            }
            else {
              this.profileImage = this.defualtImagePath;
            }
          } else {
            this.profileImage = this.defualtImagePath;
          }
        } 
      },
      error: (err) => {
        this.spinner.hide();
        console.log(err);
      }
    });
  }



  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const fileType = file.type;
      if (fileType === 'image/jpeg' || fileType === 'image/png') {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.profileImage = e.target.result;
        };
        reader.readAsDataURL(file);
        this.fileToUpload = file;
      } else {
        this.toastr.error('Invalid file type. Only JPEG and PNG are allowed.');
      }
    }
  }

  onSaveImage(status: string) {
    if (!this.fileToUpload && status !== 'delete') {
      this.toastr.error('No image selected to upload.');
      return;
    }
    let apiUrl = this.apiUrl.apiUrl.Login.ProfilePicture;
    const formData = new FormData();
    if (status === 'delete') {
      formData.append('ProfileImage', ''); // Send empty string to delete
    } else {
      formData.append('ProfileImage', this.fileToUpload);
    }
    this.spinner.show();
    this.commonService
      .doPost(apiUrl, formData)
      .pipe()
      .subscribe({
        next: (response) => {
          this.spinner.hide();
          if (response.success) {
            this.toastr.success(response.message);
            this.passwordForm.reset();
            if (status === 'delete') {
              this.profileImage = this.defualtImagePath; // Reset to placeholder image
            }
          } else {
            this.toastr.error('Error!', response.message);
          }
        },
        error: (err) => {
          console.error('Error', err);
          this.toastr.error('Error!', ErrorMessageConstants.Message);
        },
      });
  }

  onSubmit() {
    if (this.profileForm.valid) {
      const formData = new FormData();
      formData.append('firstName', this.profileForm.get('firstName')?.value);
      formData.append('lastName', this.profileForm.get('lastName')?.value);
      formData.append('email', this.profileForm.get('email')?.value);
      formData.append('phone', this.profileForm.get('phone')?.value || '');
      if (this.fileToUpload) {
        formData.append('ProfileImage', this.fileToUpload);
      } else {
        formData.append('ProfileImage', ''); 
      }
      const apiUrl = this.apiUrl.apiUrl.Login.ProfilePicture;
      this.spinner.show();
      this.commonService
        .doPost(apiUrl, formData)
        .subscribe({
          next: (response) => {
            this.spinner.hide();
            if (response.success) {
              this.toastr.success(response.message);
              this.fetchAdminDetails();
            } else {
              this.toastr.error('Error!', response.message);
            }
          },
          error: (err) => {
            this.spinner.hide();
            console.error('Error', err);
            this.toastr.error('Error!', ErrorMessageConstants.Message);
          },
        });
    } else {
      this.toastr.error('Please fill all required fields correctly.');
    }
  }


  onCancel() {
    this.profileForm.reset();
    this.profileImage = null;
  }


  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      return;
    }
    const { oldPassword, newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.toastr.error(ErrorMessageConstants.BothPasswordNotMatch);
      return;
    }
    let apiUrl = this.apiUrl.apiUrl.Login.ChangePassword;
    const data = {
      oldPassword: oldPassword,
      newPassword: newPassword,
      confirmPassword: confirmPassword
    };
   this.commonService
      .doPost(apiUrl, data)
      .pipe()
      .subscribe({
        next: (response) => {
          this.spinner.hide();
          if (response.success) {
            this.toastr.success(response.message);
            this.passwordForm.reset();
          } else {
            this.toastr.error('Error!', response.message);
          }
        },
        error: (err) => {
          console.error('Error', err);
          this.toastr.error('Error!', ErrorMessageConstants.Message);
        },
      });
  }



  setPlaceholderImage(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/images/NoImageUpload.png';
  }
}

