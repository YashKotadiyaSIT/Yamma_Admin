import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiUrlHelper } from '../../../common/api-url-helper';
import { UserConstants } from '../../../common/Constants/LabelConstants';
import { RegexPatterns } from '../../../common/Validation/Validation';
import { CommonService } from '../../../service/common/common.service';

@Component({
  selector: 'app-user-addedit',
  standalone: false,
  templateUrl: './user-addedit.html',
  styleUrl: './user-addedit.scss',
})
export class UserAddedit {
  userForm: FormGroup;
  profilePicture: string | ArrayBuffer | null = null;
  imageError: string = '';
  roleList: { roleId: number, roleName: string; }[] = [];
  UserConstants:any=UserConstants
  @Input() userId: number | null = null;
  @Input() isView: boolean = true;
  @Output() refreshGrid: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private apiUrl: ApiUrlHelper,
    private commonService: CommonService,
    private spinner: NgxSpinnerService,
    private toster: ToastrService
  ) { }

  ngOnInit(): void {
    this.userForm = this.fb.group({
      userId: [''],
      profilePicture: [{ value: '', disabled: this.isView }],
      firstName: [{ value: '', disabled: this.isView }, [Validators.required, Validators.pattern(/^[A-Za-z0-9 ]+$/), Validators.maxLength(30)]],
      lastName: [{ value: '', disabled: this.isView }, [Validators.required, Validators.pattern(/^[A-Za-z0-9 ]+$/), Validators.maxLength(30)]],
      phoneNo: [ { value: '', disabled: this.isView }, [Validators.required, Validators.pattern(/^[0-9]{10,13}$/)]],
      emailId: [{ value: '', disabled: this.userId > 0 }, [Validators.required, Validators.pattern(RegexPatterns.email)]],
      roleId: [{ value: '', disabled: this.isView }, Validators.required],
      profilePath: [{ value: '', disabled: this.isView }]
    });

    this.loadUserData(this.userId || 0);
  }

  loadUserData(userId: number): void {
    const apiUrl = this.apiUrl.apiUrl.user.getUserDetailsById.replace('{id}', userId.toString());
    this.spinner.show();
    this.commonService.doGet(apiUrl).subscribe({
      next: (response) => {
        this.spinner.hide();
        this.profilePicture = 'https://via.placeholder.com/200';
        if (response.success && response.data) {
          this.roleList = response.data.roleList || [];

          if (userId) {
            const user = response.data.user;
            this.userForm.patchValue({
              userId: user.userId,
              firstName: user.firstName,
              lastName: user.lastName,
              phoneNo: user.phoneNo,
              emailId: user.emailId,
              roleId: user.roleId || '',
              profilePath: user.profilePicture || ''
            });

            if (user.profilePicture) {
              this.profilePicture = user.profilePicture; // assume API returns base64 or URL
            }
          }
        }
        else {
          this.toster.error('Failed to load user details.');
        }
      },
      error: () => {
        this.spinner.hide();
        this.toster.error('Something went wrong. Please try again later.');
      }
    });
  }

  onImageUpload(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];

      if (!file.type.startsWith('image/')) {
        this.imageError = 'Only image files are allowed.';
        this.toster.error('Invalid file type. Only JPEG and PNG are allowed.');
        fileInput.value = '';
        return;
      }

      this.imageError = '';
      this.userForm.patchValue({ profilePicture: file });

      const reader = new FileReader();
      reader.onload = () => {
        this.profilePicture = reader.result;
      };
      reader.readAsDataURL(file);
    }
    fileInput.value = '';
  }

  deleteImage(): void {
    this.profilePicture = null;
    this.userForm.patchValue({ profilePicture: null });
    this.imageError = '';
  }

  onSubmit() {
    if (this.userForm.valid) {
      const userData = this.userForm.value;
      const formData = new FormData();

      formData.append('userId', userData.userId ? userData.userId : 0);
      formData.append('rolename', this.roleList.find(r => r.roleId == userData.roleId)?.roleName || '');

      for (const key in userData) {
        if (userData[key] !== null && userData[key] !== undefined && key !== 'userId') {
          if (key === 'profilePicture' && userData[key] instanceof File) {
            formData.append('profilePicture', userData[key]);
          } else {
            formData.append(key, userData[key]);
          }
        }
      }

      const apiUrl = this.apiUrl.apiUrl.user.addUpdateUser;
      this.spinner.show();
      this.commonService.doPost(apiUrl, formData).subscribe({
        next: (response) => {
          this.spinner.hide();
          if (response.success) {
            this.toster.success(response.message);
            this.activeModal.close(response);
            this.refreshGrid.emit();
          } else {
            this.toster.error(response.message);
          }
        },
        error: (err) => {
          this.spinner.hide();
          console.error(err);
          this.toster.error('Failed to save user. Please try again later.');
        }
      });
    } else {
      this.userForm.markAllAsTouched();
    }
  }

  closeModal() {
    if (this.userForm.valid) {
      this.refreshGrid.emit();
      this.activeModal.close(this.userForm.value);
    } else {
      this.userForm.markAllAsTouched();
    }
  }

  dismissModal() {
    this.activeModal.dismiss('Cancelled');
  }

  isInvalid(controlName: string): boolean {
    const control = this.userForm.get(controlName);
    return control?.invalid && (control?.touched || control?.dirty);
  }

  setPlaceholderImage(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/images/NoImageUpload.png';
  }
}
