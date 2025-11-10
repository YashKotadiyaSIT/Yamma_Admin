import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiUrlHelper } from '../../../common/api-url-helper';
import { CommonService } from '../../../service/common/common.service';

@Component({
  selector: 'app-coupon-addedit',
  standalone: false,
  templateUrl: './coupon-addedit.html',
  styleUrl: './coupon-addedit.scss',
})
export class CouponAddedit {
  couponForm: FormGroup;
  couponImage: string | ArrayBuffer | null = null;
  imageError: string = '';
  today: string;
  colorList : any[] = [];
  @Input() couponId: number | null = null;
  @Output() refreshGrid: EventEmitter<void> = new EventEmitter<void>();
    readonly MAX_LINES = 4;
      @ViewChild('termsTextarea') termsTextarea!: ElementRef;



  usedCount: number = 0; // coupon used count till now

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private toster: ToastrService,
    private apiUrl: ApiUrlHelper,
    private commonService: CommonService,
    private spinner: NgxSpinnerService,
  ) { 
    this.FetchColordetail();
  }

  ngOnInit(): void {
    const now = new Date();
    this.today = now.toISOString().split('T')[0]; // Format: 'yyyy-MM-dd'
    this.couponForm = this.fb.group(
      {
        couponId: [''],
        couponImage: [''],
        couponRewardType: [2], // 1 for Percentage, 2 for Amount
        couponColor: [{ value: '', disabled: false }, Validators.required],
        couponTitle: ['', [Validators.required]],
        couponCode: [ { value: null, disabled: true },[Validators.required, Validators.maxLength(8)]],
        termsAndConditions: ['', [Validators.required, Validators.maxLength(400)]],
        amount: [{ value: null, disabled: true }, [Validators.required,Validators.min(0) ,Validators.pattern(/^\d{1,4}(\.\d{1,2})?$/)]],
        percentage: [{ value: null, disabled: true }, [Validators.required, Validators.min(0), Validators.max(100)]],
        startDate: ['', Validators.required],
        expiryDate: ['', Validators.required],
        minAmount: [null, [Validators.required, Validators.min(0),Validators.pattern(/^\d{1,4}(\.\d{1,2})?$/)]],
        maxUsageLimit: [null, [Validators.required, Validators.min(1),Validators.max(7)]]
      },
      {
        validators: (group) => {
          const startDate = group.get('startDate')?.value;
          const expiryDate = group.get('expiryDate')?.value;
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Normalize time
          if (startDate && expiryDate) {
            const start = new Date(startDate);
            const end = new Date(expiryDate);

            if (start > end) {
              return { dateRangeInvalid: true };
            }
            if (end <= today) {
              return { expiryInvalid: true };
            }
          }
          return null;
        }
      }
    );
    this.onTypeChange(2);

    // if editing, load coupon details
    if (this.couponId) {
      this.loadCouponData(this.couponId);
      this.couponForm.get('couponRewardType')?.disable();
    }
    else if (this.couponId == 0) {
      this.generateCouponCode();
    }

  }

  loadCouponData(couponId: number): void {
    let apiUrl = this.apiUrl.apiUrl.coupon.GetCouponById.replace('{id}', couponId.toString());
    this.spinner.show();
    this.commonService.doGet(apiUrl).pipe().subscribe({
      next: (response) => {
        this.spinner.hide();
        if (response.success && response.data) {
          const coupon = response.data[0];

          this.usedCount = coupon.usedCount ?? 0; // API must return usedCount

          //update maxUsageLimit validator with dynamic min
          this.couponForm.get('maxUsageLimit')?.setValidators([
            Validators.required,
            Validators.min(this.usedCount || 1),
            Validators.max(7)
          ]);
          this.couponForm.get('maxUsageLimit')?.updateValueAndValidity();

          // patch values
          this.couponForm.patchValue({
            couponId: coupon.couponId,
            couponRewardType: coupon.couponRewardType,
            couponColor: coupon.couponColor,
            couponTitle: coupon.couponTitle,
            couponCode: coupon.couponCode,
            termsAndConditions: coupon.termsAndConditions,
            amount: coupon.amount || null,
            percentage: coupon.percentage || null,
            startDate: coupon.startDate ? coupon.startDate.split('T')[0] : '',
            expiryDate: coupon.expiryDate ? coupon.expiryDate.split('T')[0] : '',
            minAmount: coupon.minAmount,
            maxUsageLimit: coupon.maxUsageLimit
          });

          this.couponForm.get('amount')?.disable();
          this.couponForm.get('percentage')?.disable();

        } else {
          this.toster.error('Failed to load coupon details.');
        }
      },
      error: () => {
        this.toster.error('Error fetching coupon data.');
      }
    });
  }

  generateCouponCode() {
    const code = this.generateRandomCode(8);
    this.couponForm.get('couponCode')?.setValue(code);
  }

  generateRandomCode(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  closeModal() {
    if (this.couponForm.valid) {
      this.refreshGrid.emit();
      this.activeModal.close(this.couponForm.value);
    } else {
      this.couponForm.markAllAsTouched();
    }
  }

  onImageUpload(event: Event): void {
    const fileInput = event.target as HTMLInputElement;

    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];

      if (!file.type.startsWith('image/')) {
        this.imageError = 'Only image files are allowed.';
        fileInput.value = ''; // Reset the file input
        return;
      }

      this.imageError = '';

      this.couponForm.patchValue({ couponImage: file });

      const reader = new FileReader();
      reader.onload = () => {
        this.couponImage = reader.result;
        this.couponForm.get('couponColor')?.disable();
      };
      reader.readAsDataURL(file);
    }

    fileInput.value = ''; // Reset the file input to allow re-uploading the same file
  }

  deleteImage(): void {
    this.couponImage = null;
    this.couponForm.get('couponColor')?.enable();
    this.couponForm.patchValue({ couponImage: null });
    this.imageError = '';
  }

  onSubmit() {
    if (this.couponForm.valid) {
      if(this.couponForm.controls['couponRewardType'].value == 2){
        const amount = parseFloat(this.couponForm.controls['amount'].value);
        const minAmount = parseFloat(this.couponForm.controls['minAmount'].value);

        if (amount >= minAmount) {
          this.toster.error("Please enter Amount less than Minimum Amount");
          return;
        }
      }


 

      const couponData = this.couponForm.getRawValue(); // includes disabled fields
      const formData = new FormData();

      // Append the couponId if it exists
      formData.append('couponId', couponData.couponId ? couponData.couponId : 0);

      // Append all other form fields to FormData
      for (const key in couponData) {
        if (couponData[key] !== null && couponData[key] !== undefined && key !== 'couponId') {
          if (key === 'couponImage' && couponData[key] instanceof File) {
            formData.append('couponImage', couponData[key]);
          } else {
            formData.append(key, couponData[key]);
          }
        }
      }

      let apiUrl = this.apiUrl.apiUrl.coupon.AddUpdateCoupon;

      this.commonService
        .doPost(apiUrl, formData)
        .pipe()
        .subscribe({
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
            this.toster.error('Failed to save coupon. Please try again later.');
          },
        });
    } else {
      this.couponForm.markAllAsTouched();
    }
  }

  onTypeChange(selectedType: number): void {
    if (selectedType === 1) {
      this.couponForm.get('percentage')?.enable();
      this.couponForm.get('amount')?.reset();
      this.couponForm.get('amount')?.disable();
    } else if (selectedType === 2) {
      this.couponForm.get('amount')?.enable();
      this.couponForm.get('percentage')?.reset();
      this.couponForm.get('percentage')?.disable();
    }
  }

  onInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;

    // Remove spaces and convert to uppercase
    const newValue = inputElement.value.replace(/\s+/g, '').toUpperCase();

    inputElement.value = newValue;
  }

  dismissModal() {
    this.activeModal.dismiss('Cancelled');
  }

  isInvalid(controlName: string): boolean {
    const control = this.couponForm.get(controlName);
    return control?.invalid && (control?.touched || control?.dirty);
  }

  FetchColordetail() {
    this.spinner.show();
    let apiUrl = this.apiUrl.apiUrl.coupon.colorlist;

    this.commonService
      .doGet(apiUrl)
      .pipe()
      .subscribe({
        next: (response) => {
          this.spinner.hide();
          if (response.success) {
            this.colorList = Array.isArray(response.data) ? response.data : [];
          } else {
            this.colorList = [];
            this.spinner.hide();
            console.error('No coupon found or error occurred', response.message);
          }
        },
        error: (err) => {
          this.spinner.hide();
          console.error(err);
        },
      });
  }

  limitLinesByHeight() {
    const textarea = this.termsTextarea.nativeElement;
    // Check if the scroll height is greater than the client height
    if (textarea.scrollHeight > textarea.clientHeight) {
      // If it is, trim the last character to prevent the new line from being added
      const value = this.couponForm.get('termsAndConditions')?.value;
      if (value) {
        this.couponForm.get('termsAndConditions')?.setValue(value.slice(0, -1));
      }
    }
  }

  

}