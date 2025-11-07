import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiUrlHelper } from '../../../../common/api-url-helper';
import { AuthService } from '../../../../service/authService/auth.service';
import { CommonService } from '../../../../service/common/common.service';
import { ProfileService } from '../../../../service/Shared/profile.service';

@Component({
  selector: 'app-nav-right',
  standalone: false,
  templateUrl: './nav-right.html',
  styleUrl: './nav-right.scss',
})
export class NavRight {
  profileImage: string | null = null;
  firstname: string;
  lastname: string;
  constructor(
    private router: Router,
    private service: AuthService,
    private apiUrl: ApiUrlHelper,
    private commonService: CommonService,
    private spinner: NgxSpinnerService,
    private profileService: ProfileService
  ) {
  }

  ngOnInit(): void {
    this.profileService.profileDetail$.subscribe(profile => {
      this.firstname = profile?.firstName;
      this.lastname = profile?.lastName;
      this.profileImage = profile?.profileImage;
    });
    this.fetchAdminDetails();
  }

 
  logout() {
    this.service.logout();
  }

  profile() {
    this.router.navigate(['admin-profile']);
  }

  fetchAdminDetails() {
    let apiUrl = this.apiUrl.apiUrl.Login.ProfilePicture;
    this.spinner.show();
    this.commonService.doGet(apiUrl).pipe().subscribe({
      next: (response) => {
        this.spinner.hide();
        if (response.success) {
          if (response.data) {
            this.firstname = response.data.firstName;
            this.lastname = response.data.lastName;
            if (response.data.profilePicture) {
              this.profileImage = response.data.profilePicture;
            }
            else {
              this.profileImage = 'https://via.placeholder.com/200';
            }
          } else {
            this.profileImage = 'https://via.placeholder.com/200';
          }
        } else {

        }
      },
      error: (err) => {
        this.spinner.hide();
        console.log(err);
      }
    });
  }

  setPlaceholderImage(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/images/NoImageUpload.png';
  }
}
