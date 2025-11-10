import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiUrlHelper } from '../../../common/api-url-helper';
import { CommonService } from '../../../service/common/common.service';

@Component({
  selector: 'app-booking-details',
  standalone: false,
  templateUrl: './booking-details.html',
  styleUrl: './booking-details.scss',
})
export class BookingDetails {
  bookingId: string
  bookingData: any
  isSlotDetailsOpen = true; // default open

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private apiUrl: ApiUrlHelper,
    private commonService: CommonService
  ) {

  }

  ngOnInit(): void {
    const encryptedId =this.activatedRoute.snapshot.paramMap.get('id')!;
    this.bookingId = this.commonService.Decrypt(encryptedId);
    this.getBookingdetail();
  }

  goBack(): void {
    this.router.navigate(['/booking/list']);
  }

  getBookingdetail() {
    this.spinner.show();
    let apiUrl = this.apiUrl.apiUrl.booking.BookingDetails.replace('{id}', this.bookingId);
    this.commonService.doGet(apiUrl).pipe().subscribe({
      next: (response) => {
        this.spinner.hide();
        if (response.success) {
          this.bookingData = response.data;
        }
      },
      error: (err) => {
        this.spinner.hide();
        console.log(err);
      }
    });
  }
}
