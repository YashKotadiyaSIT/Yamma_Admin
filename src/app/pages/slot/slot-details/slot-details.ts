import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiUrlHelper } from '../../../common/api-url-helper';
import { ProgressReportMasterDetail } from '../../../interface/Report-interface';
import { CommonService } from '../../../service/common/common.service';

@Component({
  selector: 'app-slot-details',
  standalone: false,
  templateUrl: './slot-details.html',
  styleUrl: './slot-details.scss',
})
export class SlotDetails {
  bookingdetailsId: string
  bookingData: any
  isSlotDetailsOpen = true; // default open
  ProgressReportMasterDetail: ProgressReportMasterDetail = {
    skillLevels: [],
    activities: [],
    studentProgress: [],
    processedReport: [] // This will hold the final grid data
  };

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private apiUrl: ApiUrlHelper,
    private commonService: CommonService
  ) {

  }

  ngOnInit(): void {

    const encryptedId = this.activatedRoute.snapshot.paramMap.get('id')!;
    this.bookingdetailsId = this.commonService.Decrypt(encryptedId);
    this.getSlotdetails();
  }



  goBack(): void {
    this.router.navigate(['/slot/list']);
  }

  getSlotdetails() {
    this.spinner.show();
    let apiUrl = this.apiUrl.apiUrl.slot.slotdetail + "/" + this.bookingdetailsId;
    this.commonService.doGet(apiUrl).pipe().subscribe({
      next: (response) => {
        ;
        this.spinner.hide();
        if (response.success) {
          this.bookingData = response.data.slotdetail[0];
          if (response.data.slotWiseReportDetail.length > 0) {
            this.ProgressReportMasterDetail.skillLevels = response.data.skillLevel;
            this.ProgressReportMasterDetail.activities = response.data.activity;
            this.ProgressReportMasterDetail.studentProgress = response.data.slotWiseReportDetail;
            this.processReportData();

          }
        }
      },
      error: (err) => {
        this.spinner.hide();
        console.log(err);
      }
    });
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
