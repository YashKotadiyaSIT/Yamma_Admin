import { Component, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { ApiUrlHelper } from '../../../common/api-url-helper';
import { LicenseType, VehicleTransmissionLabel, LicenseTypeLabel, MENU, RIGHTS, LicenseTypeNameToId, VerificationStatus } from '../../../common/Constants/EnumConstants';
import { RegexPatterns } from '../../../common/Validation/Validation';
import { AuthService } from '../../../service/authService/auth.service';
import { CommonService } from '../../../service/common/common.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-instructor-detail',
  standalone: false,
  templateUrl: './instructor-detail.html',
  styleUrl: './instructor-detail.scss',
})
export class InstructorDetail {
  showFullBio: boolean = false;
  LicenseType = LicenseType;
  @ViewChild('profileImg', { static: false }) profileImgRef!: ElementRef<HTMLImageElement>;
  @ViewChild('editPersonalDetails') editPersonalDetails: any;
  @ViewChild('editVehicleDetails') editVehicleDetails: any;
  @ViewChild('editLicenseDetails') editLicenseDetailsModal!: TemplateRef<any>;
  VehicleInsurance: File | null = null;
  licenseForm!: FormGroup;
  LicenseFrontSideImage: File | null = null;
  LicenseBackSideImage: File | null = null;
  InstructorProfileImage: File | null = null;

  today: string = new Date().toISOString().split('T')[0];



  transmissionOptions = Object.entries(VehicleTransmissionLabel)
    .map(([key, value]) => ({ id: Number(key), name: value }));

  licenseTypeOptions = Object.entries(LicenseTypeLabel)
    .map(([key, value]) => ({ id: Number(key), name: value }));

  InstructorDetails: any = {};
  RejectionReason: string = "";
  DateFormatString = null;
  InstructorId: any;
  isPDI: boolean = false; // true if licenseType is 'PDI'
  isADI: boolean = false; // true if licenseType is 'ADI'
  editForm!: FormGroup;
  vehicleForm!: FormGroup;
  editRights: boolean = false;
  approveRejectRights: boolean = false;
  minExpiryDate: string = '';
  minlicenseExpiryDate: string = '';
  maxDob: string = '';
 licenseExpiryMessage: string = '';
@ViewChild('biotextarea') biotextarea!: ElementRef;
  constructor(
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private toster: ToastrService,
    private router: Router,
    private modalService: NgbModal,
    private apiUrl: ApiUrlHelper,
    private commonService: CommonService,
    private fb: FormBuilder,
    public auth: AuthService
  ) {
    this.DateFormatString = this.commonService.DateFormatString;
    const today = new Date();
    this.minlicenseExpiryDate = today.toISOString().split('T')[0];

    this.editForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern(RegexPatterns.alphaNumericWithSpace)]],
      lastName: ['', [Validators.required, Validators.pattern(RegexPatterns.alphaNumericWithSpace)]],
      dob: ['', Validators.required],
      gender: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern(RegexPatterns.email)]],
      bio: ['', [Validators.maxLength(500)]],
      phoneno: [ '', [Validators.required, Validators.pattern(/^[0-9]{10,13}$/)]],
      profileImage : [''],
      instructorId: ['']
    });

    this.vehicleForm = this.fb.group({
      vehicleRegistrationNo: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9 ]{8,10}$/)]],
      vehicleManufacturer: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9 ]{2,50}$/)]],
      vehicleModel: ['', [Validators.required, Validators.pattern(/^[0-9]{4,4}$/)]],
      vehicleTransmission: ['', Validators.required],
      InsuranceValidFrom: ['', Validators.required],
      InsuranceValidTo: ['', [Validators.required]],
      vehicleInsuranceDoc: [''],
      instructorId: ['']
    });

    this.licenseForm = this.fb.group({
      licenseType: ['', Validators.required],
      drivingSchoolName: ['', [Validators.required, Validators.pattern(RegexPatterns.alphabetsWithSpace)]],
      licenseADIPDINumber: ['', [Validators.required, Validators.pattern(RegexPatterns.alphaNumeric)]],
      licenseValidFrom: ['', Validators.required],
      licenseValidTo: ['', Validators.required],
      licenseNumber: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]{16}$/)]],
      LicenseFrontSideImage: [''],
      LicenseBackSideImage: [''],
      instructorId: ['']
    });


    this.editRights = auth.hasRight(MENU.INSTRUCTOR_MANAGEMENT, RIGHTS.EDIT);
    this.approveRejectRights = auth.hasRight(MENU.INSTRUCTOR_MANAGEMENT, RIGHTS.APPROVE_REJECT);

     const encryptedId = decodeURIComponent(this.activatedRoute.snapshot.paramMap.get('id')!);
     this.InstructorId = this.commonService.Decrypt(encryptedId);

    this.getInstructorDetail(this.InstructorId);


    this.setMinLicenseExpiryDate(new Date());
    this.setMinInsuranceExpiryDate(new Date());

    this.vehicleForm.get('InsuranceValidFrom')?.valueChanges.subscribe((fromDateValue) => {
      if (fromDateValue) {
        const fromDate = new Date(fromDateValue);
        const today = new Date();

        let minExpiry: Date;

        if (fromDate > today) {
          // Case 3: Future date → next day
          minExpiry = new Date(fromDate);
          minExpiry.setDate(fromDate.getDate() + 1);
        } else {
          // Case 1 & 2: today or past date → today
          minExpiry = today;
        }

        this.setMinInsuranceExpiryDate(minExpiry);
      }
    });
    this.vehicleForm.get('InsuranceValidTo')?.valueChanges.subscribe(() => {
      this.licenseExpiryMessage = ''; // hide message on change
    });


    this.licenseForm.get('licenseValidFrom')?.valueChanges.subscribe((fromDateValue) => {
      if (fromDateValue) {
        const fromDate = new Date(fromDateValue);
        const today = new Date();

        let minExpiry: Date;

        if (fromDate > today) {
          // Case 3: Future date → next day
          minExpiry = new Date(fromDate);
          minExpiry.setDate(fromDate.getDate() + 1);
        } else {
          // Case 1 & 2: today or past date → today
          minExpiry = today;
        }

        this.setMinLicenseExpiryDate(minExpiry);
      }
    });
    this.licenseForm.get('licenseValidTo')?.valueChanges.subscribe(() => {
      this.licenseExpiryMessage = ''; // hide message on change
    });

    

  }

  getInstructorDetail(InstructorId: number) {
    this.spinner.show();
        let apiUrl = this.apiUrl.apiUrl.Instuctor.InstuctorDetailsById.replace('{id}', InstructorId.toString());
    this.commonService.doGet(apiUrl).pipe().subscribe({
      next: (response) => {
        this.spinner.hide();
        if (response.success) {
          this.isPDI = response.data.licenseType === 'PDI';
          this.isADI = response.data.licenseType === 'ADI';
          this.InstructorDetails = response.data;
        } else {
          this.toster.error(response.message);
        }
      },
      error: (err) => {
        this.spinner.hide();
        console.log(err);
      }
    });
  }


  SuspendUnsuspend() {
    const actionText = this.InstructorDetails.isUserActive == 0 ? 'Activate' : 'InActivate';

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you really want to ${actionText} this instructor?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, ${actionText} it!`
    }).then((result) => {
      if (result.isConfirmed) {
        let data = {
          instructorId: this.InstructorDetails.userId,
          instructorVerificationStatus: this.InstructorDetails.isUserActive == 0 ? 1 : 0
        };
        const apiUrl = this.apiUrl.apiUrl.Instuctor.InstuctorActiveInActive;

        this.spinner.show();
        this.commonService
          .doPost(apiUrl, data)
          .pipe()
          .subscribe({
            next: (response) => {
              this.spinner.hide();
              if (response.success) {
                this.toster.success(response.message);
                this.getInstructorDetail(this.InstructorDetails.instructorId);
              } else {
                this.toster.error(response.message);
                console.error('Failed :', response.message);
              }
            },
            error: (err) => {
              this.spinner.hide();
              console.error('Error :', err);
            },
          });
      }
    });
  }


  openRejectReasonPopup(content: TemplateRef<any>, type: string) {
    this.RejectionReason = '';
    this.modalService
      .open(content, {
        ariaLabelledBy: 'modal-basic-title',
        centered: true,
        backdrop: 'static',
        keyboard: false
      })
      .result.then(
        (result) => {
          this.rejectInstructor(type);
        },
        (reason) => { }
      );
  }

  approveInstructor(type: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to approve ' + type + ' for this instructor?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Approve',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        let data = {
          instructorId: this.InstructorDetails.userId,
          type: type,
          status: 1,
          instructorRejectReason: ''
        };

        const apiUrl = this.apiUrl.apiUrl.Instuctor.InstuctorApproveReject;

        this.spinner.show();
        this.commonService
          .doPost(apiUrl, data)
          .subscribe({
            next: (response) => {
              this.spinner.hide();
              if (response.success) {
                this.toster.success(response.message);
                this.getInstructorDetail(this.InstructorDetails.instructorId);
              } else {
                this.toster.error(response.message);
                console.error('Failed :', response.message);
              }
            },
            error: (err) => {
              this.spinner.hide();
              console.error('Error :', err);
            },
          });
      }
    });
  }



  rejectInstructor(type: string) {
    let data = {
      instructorId: this.InstructorDetails.userId,
      type: type,
      status: 3,
      instructorRejectReason: this.RejectionReason.toString()
    };
    const apiUrl = this.apiUrl.apiUrl.Instuctor.InstuctorApproveReject;
    this.spinner.show();
    this.commonService
      .doPost(apiUrl, data)
      .pipe()
      .subscribe({
        next: (response) => {
          this.spinner.hide();
          if (response.success) {
            this.toster.success(response.message);
            this.RejectionReason = "";
            this.getInstructorDetail(this.InstructorDetails.instructorId);
          } else {
            this.toster.success(response.message);
            console.error('Failed :', response.message);
          }
        },
        error: (err) => {
          this.spinner.hide();
          console.error('Error :', err);
        },
      });
  }


  downloadAccordionPdf(): void {
    // A small timeout is generally good practice to ensure DOM is fully rendered,
    // especially if profileImgRef relies on *ngIf or other async rendering.
    setTimeout(() => {
      const doc = new jsPDF();
      let y = 10;

      const formatDate = (dateStr: string): string => {
        if (!dateStr) return '';
        // Ensure dateStr is a string before splitting, to avoid errors
        const [year, month, day] = String(dateStr).split('T')[0].split('-');
        return `${day}/${month}/${year}`;
      };

      // Define a function to generate the rest of the PDF content
      // This function will be called AFTER the image is loaded (or if no image exists)
      const generatePdfContent = () => {
        const subscription = this.InstructorDetails.subscriptionDetails?.trim()
          ? this.InstructorDetails.subscriptionDetails
          : 'No Active Plan';

        doc.setFontSize(16);
        doc.text('Instructor Details', 10, y);
        y += 10;

        // ==== PERSONAL DETAILS ====
        const personalBoxHeight = 50;
        y += 10;
        doc.setFontSize(12);
        doc.rect(10, y, 190, personalBoxHeight);
        doc.text('Personal Details', 12, y + 5);
        doc.setFontSize(10);
        doc.text(`Name: ${this.InstructorDetails.instructorFirstName} ${this.InstructorDetails.instructorLastName}`, 12, y + 15);
        doc.text(`Date of Birth: ${formatDate(this.InstructorDetails.instructorDOB)}`, 12, y + 22);
        doc.text(`Email: ${this.InstructorDetails.instructorEmail}`, 12, y + 29);
        doc.text(`Gender: ${this.InstructorDetails.gender}`, 12, y + 36);
        doc.text(`Phone: ${this.InstructorDetails.userPhone}`, 12, y + 43);
        // Image will be added here
        y += personalBoxHeight + 10; // Adjust Y position after the personal details box

        // ==== LICENSE DETAILS ====
        const licenseBoxHeight = this.InstructorDetails.licenseType === 'PDI' ? 55 : 50;
        doc.setFontSize(12);
        doc.rect(10, y, 190, licenseBoxHeight);
        doc.text('License Details', 12, y + 7);
        doc.setFontSize(10);
        let textY = y + 15;
        doc.text(`License Type: ${this.InstructorDetails.licenseType}`, 12, textY);
        textY += 7;
        if (this.InstructorDetails.licenseType === 'PDI') {
          doc.text(`Driving School Name: ${this.InstructorDetails.drivingSchoolName}`, 12, textY);
          textY += 7;
        }
        const licenseLabel = this.InstructorDetails.licenseType === 'PDI' ? 'PDI Number' : 'ADI Number';
        doc.text(`${licenseLabel}: ${this.InstructorDetails.licenseADIPDINumber}`, 12, textY);
        textY += 7;
        doc.text(`Valid From: ${formatDate(this.InstructorDetails.licenseValidFrom)}`, 12, textY);
        textY += 7;
        doc.text(`Expiry Date: ${formatDate(this.InstructorDetails.licenseValidTo)}`, 12, textY);
        textY += 7;
        doc.text(`Driving License Number: ${this.InstructorDetails.licenseNumber}`, 12, textY);

        y += licenseBoxHeight + 10;

        // ==== VEHICLE INFORMATION ====
        const vehicleBoxHeight = 45;
        doc.setFontSize(12);
        doc.rect(10, y, 190, vehicleBoxHeight);
        doc.text('Vehicle Information', 12, y + 5);
        doc.setFontSize(10);
        doc.text(`Registration Number: ${this.InstructorDetails.vehicleRegistrationNo}`, 12, y + 15);
        doc.text(`Type Of Driving: ${this.InstructorDetails.vehicleTransmission}`, 12, y + 22);
        doc.text(`Valid From: ${formatDate(this.InstructorDetails.vehicleValidFrom)}`, 12, y + 29);
        doc.text(`Expiry Date: ${formatDate(this.InstructorDetails.vehicleValidTo)}`, 12, y + 35);
        y += vehicleBoxHeight + 10;

        // ==== SUBSCRIPTION DETAILS ====
        const subscriptionBoxHeight = 20;
        doc.setFontSize(12);
        doc.rect(10, y, 190, subscriptionBoxHeight);
        doc.text('Subscription Details', 12, y + 5);
        doc.setFontSize(10);
        doc.text(`Details: ${subscription}`, 12, y + 15);
        y += subscriptionBoxHeight + 10;

        // ==== AREA DETAILS ====
        const areaBoxHeight = 25;
        doc.setFontSize(12);
        doc.rect(10, y, 190, areaBoxHeight);
        doc.text('Areas Where They Serve', 12, y + 5);
        doc.setFontSize(10);
        doc.text(`City: ${this.InstructorDetails.city}`, 12, y + 15);
        doc.text(`Town: ${this.InstructorDetails.town}`, 12, y + 22);

        doc.save('InstructorDetails.pdf'); // Final save operation
      };

      const imgElement = this.profileImgRef?.nativeElement;

      if (imgElement && imgElement.src) {
        let imageUrl = imgElement.src;

        // Fix double slashes
        imageUrl = imageUrl.replace(/([^:]\/)\/+/g, "$1");

        const image = new Image();
        image.crossOrigin = "anonymous"; // Important for CORS
        image.src = imageUrl; // Set it only once

        image.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          const ctx = canvas.getContext("2d");

          if (ctx) {
            ctx.drawImage(image, 0, 0);

            const imgData = canvas.toDataURL("image/jpeg");

            if (imgData) {
              const base64Data = imgData.split(',')[1];

              try {
                // Add image here. Note that 'y' for the image is relative to the *start* of the PDF generation,
                // so ensure its position makes sense regardless of other content.
                // You might need to calculate the precise 'y' based on the current content height.
                // For now, it will be placed relative to the 'Personal Details' box.
                doc.addImage(base64Data, "JPEG", 150, y + 23, 45, 45);

                // Now that the image is loaded and added, generate the rest of the PDF
                generatePdfContent();

              } catch (error) {
                console.error("Error adding image to PDF:", error);
                // If image adding fails, still try to generate the rest of the PDF
                generatePdfContent();
              }
            } else {
              console.error("Failed to retrieve Base64 image data.");
              generatePdfContent(); // Generate PDF even without image if data is missing
            }
          } else {
            console.error("Could not get 2D context from canvas.");
            generatePdfContent(); // Generate PDF even without image if context fails
          }
        };

        image.onerror = (err) => {
          console.error("Error loading image:", err);
          generatePdfContent(); // Generate PDF even if image fails to load
        };
      } else {
        console.warn("Image element is not available or src is empty. Generating PDF without image.");
        generatePdfContent(); // If no image, generate PDF immediately
      }
    }, 100); // Small delay to ensure view is rendered
  }

  setPlaceholderImage(event: Event) {
    (event.target as HTMLImageElement).src = '/assets/images/NoImageUpload.png';
  }
  goBack(): void {
    this.router.navigate(['/instructor']);
  }

  openEditModal() {

    const dob = this.InstructorDetails.instructorDOB
      ? this.InstructorDetails.instructorDOB.split('T')[0]
      : '';

    // Calculate max DOB (today - 18 years)
    const today = new Date();
    const cutoffDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    this.maxDob = cutoffDate.toISOString().split('T')[0]; // Format as yyyy-MM-dd

    this.editForm.patchValue({
      firstName: this.InstructorDetails.instructorFirstName,
      lastName: this.InstructorDetails.instructorLastName,
      dob: dob,
      gender: this.InstructorDetails.gender == 'Male' ? '1' : '2',
      email: this.InstructorDetails.instructorEmail,
      bio: this.InstructorDetails.bio,
      instructorId: this.InstructorDetails.userId,
      phoneno: this.InstructorDetails.userPhone
    });
    this.modalService.open(this.editPersonalDetails, { centered: true, size: 'lg' });
  }

  openEditVehicleModal() {
    this.vehicleForm.patchValue({
      vehicleRegistrationNo: this.InstructorDetails.vehicleRegistrationNo,
      vehicleManufacturer: this.InstructorDetails.vehicleManufacturer,
      vehicleModel: this.InstructorDetails.vehicleModel,
      vehicleTransmission: this.InstructorDetails.vehicleTransmissionId,
      InsuranceValidFrom: this.formatDate(this.InstructorDetails.vehicleValidFrom),
      instructorId: this.InstructorDetails.userId,
    });
    
     const validTo = new Date(this.InstructorDetails.vehicleValidTo);
    const today = new Date();
    if (validTo >= today) {
      this.vehicleForm.controls['InsuranceValidTo'].setValue(this.formatDate(validTo));
    } else {
        this.licenseExpiryMessage = 'Vehicle expiry date is in the past. Please update it.';
    }


    this.modalService.open(this.editVehicleDetails, { centered: true, size: 'lg' });
  }


  openEditLicenseModal() {
    this.licenseForm.patchValue({
      licenseType: LicenseTypeNameToId[this.InstructorDetails.licenseType],
      drivingSchoolName: this.InstructorDetails.drivingSchoolName,
      licenseADIPDINumber: this.InstructorDetails.licenseADIPDINumber,
      licenseValidFrom: this.formatDate(this.InstructorDetails.licenseValidFrom),
      licenseNumber: this.InstructorDetails.licenseNumber,
      instructorId: this.InstructorDetails.userId,
    });

    if (this.licenseForm.controls['licenseType'].value == '1') {
      this.licenseForm.controls['drivingSchoolName'].clearValidators();
    } else {
      this.licenseForm.controls['drivingSchoolName'].setValidators([
        Validators.required,
        Validators.pattern(RegexPatterns.alphabetsWithSpace)
      ]);
    }
    this.licenseForm.controls['drivingSchoolName'].updateValueAndValidity();

    // ADIPDI Number validation
    if (this.licenseForm.controls['licenseType'].value == '1') {
      // ADI: exactly 6 alphanumeric characters
      this.licenseForm.controls['licenseADIPDINumber'].setValidators([
        Validators.required,
        Validators.pattern(/^[0-9]{6}$/)
      ]);
    } else {
      // PDI: 8 to 10 alphanumeric characters
      this.licenseForm.controls['licenseADIPDINumber'].setValidators([
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9]{8,10}$/)
      ]);
    }
    this.licenseForm.controls['licenseADIPDINumber'].updateValueAndValidity();

    const validTo = new Date(this.InstructorDetails.licenseValidTo);
    const today = new Date();
    if (validTo >= today) {
      this.licenseForm.controls['licenseValidTo'].setValue(this.formatDate(validTo));
    } else {
        this.licenseExpiryMessage = 'License expiry date is in the past. Please update it.';
    }

    this.modalService.open(this.editLicenseDetailsModal, { centered: true, size: 'lg' });
  }

    saveChanges(modal: any) {
        if (this.editForm.valid) {

          const formData = new FormData();
          Object.keys(this.editForm.value).forEach(key => {
            const value = this.editForm.value[key];
            if (key !== 'profileImage' && value !== null && value !== '') {
              formData.append(key, value);
            }
          });
          if (this.InstructorProfileImage) {
            formData.append('profileImage', this.InstructorProfileImage);
          }


          let apiUrl = this.apiUrl.apiUrl.Instuctor.UpdateProfile;
          this.spinner.show();

          this.commonService
            .doPost(apiUrl, formData)
            .pipe()
            .subscribe({
              next: (response) => {
                this.spinner.hide();
                if (response.success) {
                  this.getInstructorDetail(this.InstructorDetails.instructorId);
                  this.InstructorProfileImage = null;
                  this.toster.success(response.message);
                  modal.close();
                } else {
                  this.toster.error(response.message);
                }
              },
              error: (err) => {
                this.spinner.hide();
                this.toster.error('Error!', err.message);
                modal.close();
              },
            });

          
        }
      }

  saveVehicleChanges(modal: any) {
    if (this.vehicleForm.valid) {
      const formData = new FormData();
      Object.keys(this.vehicleForm.value).forEach(key => {
        const value = this.vehicleForm.value[key];
        if (key !== 'vehicleInsuranceDoc' && value !== null && value !== '') {
          formData.append(key, value);
        }
      });
      if (this.VehicleInsurance) {
        formData.append('vehicleInsuranceDoc', this.VehicleInsurance);
      }

      const apiUrl = this.apiUrl.apiUrl.Instuctor.UpdateVehicle;

      this.commonService.doPost(apiUrl, formData).subscribe({
        next: (res: any) => {
          if (res.success) {
            modal.close();
            this.toster.success(res.message);
            this.getInstructorDetail(this.InstructorDetails.instructorId); // refresh data
            this.VehicleInsurance = null;
          }
        },
        error: (err) => {
          console.error('Error updating vehicle:', err);
        }
      });
    } else {
      this.vehicleForm.markAllAsTouched();
    }
  }


  saveLicenseChanges(modal: any) {
    if (this.licenseForm.valid) {
      const formData = new FormData();
      Object.keys(this.licenseForm.value).forEach(key => {
        formData.append(key, this.licenseForm.value[key]);
      });
      if (this.LicenseFrontSideImage) {
        formData.append('LicenseFrontSideImage', this.LicenseFrontSideImage);
      }
      if (this.LicenseBackSideImage) {
        formData.append('LicenseBackSideImage', this.LicenseBackSideImage);
      }

      this.spinner.show();
      this.commonService
        .doPost(this.apiUrl.apiUrl.Instuctor.UpdateLicense, formData)
        .subscribe({
          next: (response) => {
            this.spinner.hide();
            if (response.success) {
              this.getInstructorDetail(this.InstructorDetails.instructorId);
              this.LicenseFrontSideImage = null;
              this.LicenseBackSideImage = null;
              modal.close();
            }
          },
          error: () => {
            this.spinner.hide();
          }
        });
    }
  }


  private formatDate(date: string | Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.VehicleInsurance = file;
    }
  }

  onTransmissionChange(event: any) {
    const selectedValue = event.target.value;
    this.vehicleForm.patchValue({ vehicleTransmission: selectedValue });
  }

  onLicenseTypeChange(event: any) {
    const selectedValue = event.target.value;
    this.licenseForm.patchValue({ licenseType: selectedValue });
    if (this.licenseForm.controls['licenseType'].value == '1') {
      this.licenseForm.controls['drivingSchoolName'].clearValidators();
    } else {
      this.licenseForm.controls['drivingSchoolName'].setValidators([
        Validators.required,
        Validators.pattern(RegexPatterns.alphabetsWithSpace)
      ]);
    }
    this.licenseForm.controls['drivingSchoolName'].updateValueAndValidity();

    // ADIPDI Number validation
    if (this.licenseForm.controls['licenseType'].value == '1') {
      // ADI: exactly 6 alphanumeric characters
      this.licenseForm.controls['licenseADIPDINumber'].setValidators([
        Validators.required,
        Validators.pattern(/^[0-9]{6}$/)
      ]);
    } else {
      // PDI: 8 to 10 alphanumeric characters
      this.licenseForm.controls['licenseADIPDINumber'].setValidators([
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9]{8,10}$/)
      ]);
    }
    this.licenseForm.controls['licenseADIPDINumber'].updateValueAndValidity();
  }

  onLicenseFrontFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.LicenseFrontSideImage = event.target.files[0];
    }
  }

  onProfilePictureSelected(event: any) {
    if (event.target.files.length > 0) {
      this.InstructorProfileImage = event.target.files[0];
    }
  }

  onLicenseBackFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.LicenseBackSideImage = event.target.files[0];
    }
  }

  toggleBio(): void {
    this.showFullBio = !this.showFullBio;
  }

  private setMinLicenseExpiryDate(date: Date): void {
    this.minlicenseExpiryDate = date.toISOString().split('T')[0];
    const currentExpiry = this.licenseForm.get('licenseValidTo')?.value;
    if (currentExpiry && new Date(currentExpiry) < date) {
      this.licenseForm.get('licenseValidTo')?.setValue('');
    }
  }
  private setMinInsuranceExpiryDate(date: Date): void {
    this.minExpiryDate = date.toISOString().split('T')[0];
    const currentExpiry = this.vehicleForm.get('InsuranceValidTo')?.value;
    if (currentExpiry && new Date(currentExpiry) < date) {
      this.vehicleForm.get('InsuranceValidTo')?.setValue('');
    }
  }

  onCloseModal() {
    this.licenseForm.reset();
    this.modalService.dismissAll('Cross click');
  }

  verificationStatusPipe(value: number): string {
    const status = Number(value);
      switch (status) {
        case VerificationStatus.Approved:
          return 'Approved';
        case VerificationStatus.Pending:
          return 'Pending';
        case VerificationStatus.Rejected:
          return 'Rejected';
        default:
          return 'Unknown';
      }
    }

  limitLinesByHeight() {
    debugger
    const textarea = this.biotextarea.nativeElement;
    // Check if the scroll height is greater than the client height
    if (textarea.scrollHeight > textarea.clientHeight) {
      // If it is, trim the last character to prevent the new line from being added
      const value = this.editForm.get('bio')?.value;
      if (value) {
        this.editForm.get('bio')?.setValue(value.slice(0, -1));
      }
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.editForm.get(controlName);
    return control?.invalid && (control?.touched || control?.dirty);
  }
  limitLinesAndChars(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    let value = textarea.value;

    // Only enforce line limit
    const lines = value.split('\n');
    if (lines.length > 4) {
      value = lines.slice(0, 4).join('\n');
      this.editForm.get('bio')?.setValue(value, { emitEvent: false });
    }
  }


}
