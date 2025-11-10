import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColDef } from 'ag-grid-community';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiUrlHelper } from '../../../common/api-url-helper';
import { MENU, RIGHTS } from '../../../common/Constants/EnumConstants';
import { RegexPatterns, minAgeValidator } from '../../../common/Validation/Validation';
import { IPagination } from '../../../interface/common-interface';
import { SkillLevel, Activity, ProgressResponse, ProcessedActivityReport, ProgressReportMasterDetail } from '../../../interface/Report-interface';
import { AuthService } from '../../../service/authService/auth.service';
import { CommonService } from '../../../service/common/common.service';
import { ActionButtonRenderer } from '../../../component/action-button-renderer/action-button-renderer';

@Component({
  selector: 'app-student-detail',
  standalone: false,
  templateUrl: './student-detail.html',
  styleUrl: './student-detail.scss',
})
export class StudentDetail {
  @ViewChild('editPersonalDetails') editPersonalDetails: any;
  user: any;
  userId: string;
  bookings: any[] = [];
  columnDefination: ColDef[] = [];
  paginationData: IPagination = { PageIndex: 1, PageSize: 10, SortColumn: '', SortOrder: '' };
  editForm!: FormGroup;
  licenseFrontImageFile: File | null = null;
  licenseBackImageFile: File | null = null;
  studentProfileImage: File | null = null;
  reportMasterDetail: any;
  skillLevelMasterDetail: SkillLevel[] = [];
  ActivityMasterDetail: Activity[] = [];
  ProgressResponse : ProgressResponse[] = []; 
  ProcessedActivityReport : ProcessedActivityReport[] = []; 
  ProgressReportMasterDetail: ProgressReportMasterDetail = {
    skillLevels: [],
    activities: [],
    studentProgress: [],
    processedReport: [] // This will hold the final grid data
  };
  editRights: boolean = false;
  maxDob: string;
  private activityMap: Map<number, string> = new Map();
 

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private apiUrl: ApiUrlHelper,
    private commonService: CommonService,
    private toster: ToastrService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private auth: AuthService
  ) {
    const today = new Date();
    const year = today.getFullYear() - 18;
    const month = today.getMonth() + 1; // month is zero-based
    const day = today.getDate();

    this.maxDob = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    this.editForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern(RegexPatterns.alphaNumericWithSpace)]],
      lastName: ['', [Validators.required, Validators.pattern(RegexPatterns.alphaNumericWithSpace)]],
      dob: ['', [Validators.required, minAgeValidator(18)]],
      gender: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern(RegexPatterns.email)]],
      licenseNumber: ['', [Validators.required ,Validators.pattern(/^[a-zA-Z0-9]{16}$/)]],
      phoneno: [ '', [Validators.required, Validators.pattern(/^[0-9]{10,13}$/)]],
      licenseFrontImage: [''],
      licenseBackImage: [''],
      profileImage : [''],
      studentid: ['']
    });

    this.editRights = auth.hasRight(MENU.STUDENT_MANAGEMENT, RIGHTS.EDIT);
  }



  ngOnInit(): void {
    this.userId = this.commonService.Decrypt(this.activatedRoute.snapshot.paramMap.get('id'));

    this.fetchUserById(this.userId);
    this.initializeColumnDefinitions();
    this.fetchReportMasterDetail();
  }

  initializeColumnDefinitions(): void {
    this.columnDefination = [
      { headerName: 'No.', resizable: false, valueGetter: (params: any) => params.node.rowIndex + 1 },
      { headerName: 'Booking Type', field: 'bookingType', minWidth: 300, resizable: false },
      { headerName: 'Total Hours', field: 'approvedHours', minWidth: 200, resizable: false },
      { headerName: 'Total Price', field: 'totalAmount', minWidth: 200, resizable: false },
      { headerName: 'Offer Price', field: 'totalAmount', minWidth: 200, resizable: false },
      { headerName: 'Status', field: 'bookingStatus', minWidth: 250, resizable: false },
      {
        headerName: 'Actions',
        resizable: false,
        cellRenderer: ActionButtonRenderer,
        cellRendererParams: (params: any) => {
          const user = params.data;
          return {
            buttons: [
              {
                text: 'View Lessons',
                class: 'btn btn-primary',
                action: (booking: any) => this.viewLessons(booking.bookingId)
              }
            ]
          };
        }
      }
    ];
  }

  viewLessons(bookingId: number) {
    this.router.navigate(['/student-lesson', this.commonService.Encrypt(bookingId.toString())], {
      queryParams: { userId: this.commonService.Encrypt(this.userId.toString()) }
    });
  }


  fetchUserById(userId): void {
    let apiUrl = this.apiUrl.apiUrl.Student.StudentDetailsById.replace('{id}', userId);
    this.commonService.doGet(apiUrl).pipe().subscribe({
      next: (response) => {
        this.spinner.hide();
        if (response.success) {
          this.user = response.data;
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

   fetchReportMasterDetail(): void {
    let apiUrl = this.apiUrl.apiUrl.report.GetMasterDetails;
    this.commonService.doGet(apiUrl).pipe().subscribe({
      next: (response) => {
        this.spinner.hide();
        if (response.success) {
          this.skillLevelMasterDetail = response.data.skillLevel;
          this.ActivityMasterDetail = response.data.activity;
           this.ProgressReportMasterDetail.skillLevels = this.skillLevelMasterDetail;
           this.ProgressReportMasterDetail.activities = this.ActivityMasterDetail;
          this.StudentProgressReportDetail();
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

  StudentProgressReportDetail(){
    let apiUrl = this.apiUrl.apiUrl.report.GetStudentRepportDetail.replace('{id}', this.userId);
    this.commonService.doGet(apiUrl).pipe().subscribe({
      next: (response) => {
        this.spinner.hide();
        if (response.success) {
          this.ProgressReportMasterDetail.studentProgress = response.data;
          this.ProgressReportMasterDetail.activities.forEach(a => {
            this.activityMap.set(a.activityId, a.activityName);
          });
          this.processReportData();
        } else {
          //this.toster.error(response.message);
        }
      },
      error: (err) => {
        this.spinner.hide();
        console.log(err);
      }
    });

  }

  goBack(): void {
    this.router.navigate(['/student']);
  }

  setPlaceholderImage(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/images/NoImageUpload.png';
  }

  openEditModal() {
    this.editForm.patchValue({
      firstName: this.user.firstName ?? '',
      lastName: this.user.lastName ?? '',
      dob: this.user.dateOfBirth,
      gender: this.user.gender == 'Male' ? '1' : '2',
      email: this.user.email ?? '',
      studentid: this.user.userId ?? '',
      //licenseFrontImage: this.user.licenseFrontSideImage ?? '',
      //licenseBackImage: this.user.licenseBackSideImage ?? '',
      licenseNumber: this.user.licensenumber ?? '',
      phoneno: this.user.phone ?? ''
    });

    this.modalService.open(this.editPersonalDetails, { centered: true, size: 'lg' });
  }


  saveChanges(modal: any) {
    if (this.editForm.valid) {
      // Create FormData object
      const formData = new FormData();

      // Append all non-file form controls
      Object.keys(this.editForm.value).forEach(key => {
        if (key !== 'licenseFrontImage' && key !== 'licenseBackImage' && key !== 'profileImage') {
          formData.append(key, this.editForm.value[key]);
        } 
      });

      // Append files separately
      if (this.licenseFrontImageFile) {
        formData.append('LicenseFrontImage', this.licenseFrontImageFile);
      }
      if (this.licenseBackImageFile) {
        formData.append('LicenseBackImage', this.licenseBackImageFile);
      }

      if(this.studentProfileImage){
        formData.append('profileImage', this.studentProfileImage);
      }

      let apiUrl = this.apiUrl.apiUrl.Student.UpdateProfile;
      this.spinner.show();

      this.commonService
        .doPost(apiUrl, formData)
        .pipe()
        .subscribe({
          next: (response) => {
            this.spinner.hide();
            if (response.success) {
              this.fetchUserById(this.user.userId);
              this.licenseBackImageFile = null;
              this.licenseFrontImageFile = null;
              this.studentProfileImage = null;
              this.toster.success(response.message);
            } else {
              this.toster.error(response.message);
            }
          },
          error: (err) => {
            this.spinner.hide();
            this.toster.error('Error!', err.message);
          },
        });

      modal.close();
    }
  }

  onFileSelected(event: any, type: 'front' | 'back') {
    const file = event.target.files[0];
    if (type === 'front') {
      this.licenseFrontImageFile = file;
    } else {
      this.licenseBackImageFile = file;
    }
  }

  onchangeProfile(event: any) {
     if (event.target.files.length > 0) {
      this.studentProfileImage = event.target.files[0];
    }
  }

  processReportData(): void {
    const maxSkillByActivity: { [activityId: number]: number } = {};
    this.ProgressReportMasterDetail.studentProgress.forEach(progress => {
        maxSkillByActivity[progress.activityId] = progress.skillLevelId;
    });
    this.ProgressReportMasterDetail.processedReport = this.ProgressReportMasterDetail.activities.map(activity => {
      const maxLevel = maxSkillByActivity[activity.activityId] || 0;
      const skillLevelsAchieved: { [key: number]: boolean } = {};
      this.ProgressReportMasterDetail.skillLevels.forEach(skill => {
        skillLevelsAchieved[skill.skillLevelId] = skill.skillLevelId <= maxLevel;
      });

      return {
        activityName: activity.activityName,
        skillLevelsAchieved: skillLevelsAchieved,
        highestSkillLevel: maxLevel
      };
    })
    .filter(report => report.highestSkillLevel > 0); // Only show activities that have progress
  }

   getSkillHeaderColor(levelId: number): { [key: string]: string } {
      // ⚠️ FIX: Use the correct data property: ProgressReportMasterDetail.skillLevels
      const skill = this.ProgressReportMasterDetail.skillLevels.find(s => s.skillLevelId === levelId);
      if (skill) {
          const colorVal = parseInt(skill.colorCode, 16);
          // Simple luminance check to determine text color for contrast
          const luminance = (0.2126 * ((colorVal >> 16) & 0xFF) + 0.7152 * ((colorVal >> 8) & 0xFF) + 0.0722 * (colorVal & 0xFF));
          const isLight = luminance > 150; 
          
          return {
            'background-color': '#' + skill.colorCode,
            'color': isLight ? '#000' : '#fff', 
            'display': 'inline-block',
            'width': '50px',
            'height': '30px',
            'line-height': '25px',
            'text-align': 'center',
            'border-radius': '4px'
          };
      }
      return {};
  }
}
