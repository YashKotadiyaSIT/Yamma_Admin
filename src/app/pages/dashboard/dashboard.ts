import { Component, ElementRef, ViewChild } from '@angular/core';
import { monthsList } from '../../common/Constants/common';
import { ChartConfiguration} from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiUrlHelper } from '../../common/api-url-helper';
import { CommonService } from '../../service/common/common.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartCanvasUser') chartCanvasUser!: ElementRef<HTMLCanvasElement>;

  allyears: any;
  allyears2: any;
  availableColumnData: any[] = [];
  availableColumnData2: any[] = [];

  selectedYear: number = new Date().getFullYear();
  selectedInterval: string = 'monthly';
  chartData: any[] = [];
  selectedYear2: number = new Date().getFullYear();
  selectedUser: string = 'student';
  public barChartLegend = true;
  public barChartPlugins = [];

  allYearsChart2: any[] = [];
  selectedYearChart2: number = new Date().getFullYear();
  selectedInterval2: string = 'monthly';
  chartDataChart2: any[] = [];
  public barChartLegend2 = true;
  public barChartPlugins2 = [];

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: this.availableColumnData,
    datasets: [{ data: [500, 59, 80, 81, 56, 55, 40], label: `Admin's Earnings`, backgroundColor: '#6E0580' }]
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false, // Allow the chart to fill its container
    scales: {
      x: {
        ticks: {
          autoSkip: true, // Automatically skip x-axis labels if there's no space
          maxRotation: 0,
          minRotation: 0,
        },
      },
    },
  };

  public barChartData2: ChartConfiguration<'bar'>['data'] = {
    labels: this.availableColumnData2,
    datasets: [{ data: [88, 59, 80, 81, 56, 55, 40], label: 'Total User', backgroundColor: '#6E0580' }]
  };

  public barChartOptions2: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false, // Allow the chart to fill its container
    scales: {
      x: {
        ticks: {
          autoSkip: true, // Automatically skip x-axis labels if there's no space
          maxRotation: 0,
          minRotation: 0,
        },
      },
    }
  };

  constructor(
    private toster: ToastrService,
    private apiUrl: ApiUrlHelper,
    private commonService: CommonService,
    private spinner: NgxSpinnerService,
  ) { }

  ngOnInit(): void {
    this.selectedYear = new Date().getFullYear();
    this.selectedInterval = 'monthly';
    this.selectedYearChart2 = new Date().getFullYear();
    this.selectedInterval2 = 'monthly';
    this.getDashboardDetails();
    this.generateAvailableYears();
    this.generateAvailableYears2();

    this.generateAvailableColumnData();
    this.fetchChartDetailsChart2();
  }

 
  fetchChartDetailsChart2(): void {
 

         const apiUrl = this.apiUrl.apiUrl.dashboard.GetDashboardDetailsbyuser;

    let body = {
      selectedYear: this.selectedYear2.toString(),
      selectedInterval: this.selectedInterval2,
      userType: this.selectedUser
    };


    this.commonService.doPost(apiUrl,body).pipe().subscribe({
      next: (response) => {
        this.spinner.hide();
        if (response.success) {
          const groupedData = new Map<string, number[]>();
          let totalNumbers;

          if (this.selectedInterval2 === 'monthly') {
            totalNumbers = 12;
          } else if (this.selectedInterval2 === 'weekly') {
            totalNumbers = this.isLeapYear(this.selectedYearChart2) ? 53 : 52;
          }

          response.data.forEach((item) => {
            if (!groupedData.has(item.userType)) {
              groupedData.set(item.userType, Array(totalNumbers).fill(0));
            }
          });

          response.data.forEach((item) => {
            const userTypeData = groupedData.get(item.userType);
            let index: number;

            if (this.selectedInterval2 === 'monthly') {
              index = item.monthNumber - 1;
            } else if (this.selectedInterval2 === 'weekly') {
              index = item.weekNumber - 1;
            }

            if (index >= 0 && index < totalNumbers) {
              const activeStudents = item.totalActiveStudents || 0;
              const activeInstructors = item.totalActiveInstructors || 0;

              userTypeData![index] = activeStudents || activeInstructors;
            }
          });

          this.chartDataChart2 = Array.from(groupedData, ([userType, data]) => ({
            userType,
            data
          }));
          this.updateChartDataChart2();
          this.applyGradientToChart2();
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

  onYearChange2(): void {
    this.generateAvailableColumnData2();
    this.fetchChartDetailsChart2();
  }

  onIntervalChange2(): void {
    this.generateAvailableColumnData2();
    this.fetchChartDetailsChart2();
  }
  onUserChange2(): void {
    this.generateAvailableColumnData2();
    this.fetchChartDetailsChart2();
  }
  updateChartDataChart2(): void {
    this.barChartData2 = {
      labels:
        this.selectedInterval2 === 'monthly'
          ? monthsList
          : Array.from({ length: this.isLeapYear(this.selectedYearChart2) ? 53 : 52 }, (_, i) => `Week ${i + 1}`),
      datasets: this.chartDataChart2.map((item) => ({
        label: item.userType,
        data: item.data
      }))
    };

    if (this.chart) {
      this.chart.update();
    }
  }

  generateAvailableYears2() {
    const currentYear = new Date().getFullYear();
    this.allyears2 = [];
    for (let year = 2000; year <= currentYear; year++) {
      this.allyears2.push(year);
    }
  }
  generateAvailableYears() {
    const currentYear = new Date().getFullYear();
    this.allyears = [];
    for (let year = 2000; year <= currentYear; year++) {
      this.allyears.push(year);
    }
  }

  generateAvailableColumnData() {
    if (this.selectedInterval === 'monthly') {
      this.availableColumnData = monthsList;
    } else if (this.selectedInterval === 'weekly') {
      const weeksInYear = this.isLeapYear(this.selectedYear) ? 53 : 52;
      this.availableColumnData = Array.from({ length: weeksInYear }, (_, i) => i + 1);
    } else if (this.selectedInterval === 'daily') {
      const daysInYear = this.isLeapYear(this.selectedYear) ? 366 : 365;
      this.availableColumnData = Array.from({ length: daysInYear }, (_, i) => i + 1);
    }
  }

  generateAvailableColumnData2() {
    if (this.selectedInterval2 === 'monthly') {
      this.availableColumnData2 = monthsList;
    } else if (this.selectedInterval2 === 'weekly') {
      const weeksInYear = this.isLeapYear(this.selectedYear2) ? 53 : 52;
      this.availableColumnData2 = Array.from({ length: weeksInYear }, (_, i) => i + 1);
    }
  }

  isLeapYear(year: number): boolean {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  }

  onYearChange(): void {
    this.generateAvailableColumnData();
  }

  onIntervalChange(): void {
    this.generateAvailableColumnData();
  }

  updateChartData(): void {
    this.barChartData = {
      ...this.barChartData,
      labels: this.availableColumnData,
      datasets: [
        {
          ...this.barChartData.datasets[0],
          data: this.chartData
        }
      ]
    };

    if (this.chart) {
      this.chart.update();
    }
  }

  applyGradientToChart(): void {
    const canvas = this.chartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#1B1871');
      gradient.addColorStop(1, '#6E0580');
      this.barChartData.datasets[0].backgroundColor = gradient;

      if (this.chart) {
        this.chart.update();
      }
    }
  }

  applyGradientToChart2(): void {
    const userCanvas = this.chartCanvasUser.nativeElement;
    const ctx = userCanvas.getContext('2d');

    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 0, userCanvas.height);
      gradient.addColorStop(0, '#1B1871');
      gradient.addColorStop(1, '#6E0580');
      this.barChartData2.datasets[0].backgroundColor = gradient;

      if (this.chart) {
        this.chart.update();
      }
    }
  }
  getDashboardDetails(): void {
    let apiUrl = this.apiUrl.apiUrl.dashboard.GetDashboardCountDetails;
    this.commonService.doGet(apiUrl).pipe().subscribe({
      next: (response) => {
        this.spinner.hide();
        if (response.success) {
          this.items[0].count = response.data[0].totalStudents;
          this.items[1].count = response.data[0].totalInstructors;
          this.items[2].count = response.data[0].totalBookings;
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

  items = [
    { title: 'Total Student Register', icon: 'fas fa-user', count: '0', color: 'text-primary', design: 'col-md-12' },
    { title: 'Total Instructors Register', icon: 'fas fa-user-secret', count: '0', color: 'text-danger', design: 'col-md-12' },
    { title: 'Total Bookings', icon: 'fab fa-slack', count: '0', color: 'text-success', design: 'col-md-12' }
  ];
}
