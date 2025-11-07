import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private profileDetailSource = new BehaviorSubject<{ firstName: string, lastName: string, profileImage: string; }>(null); // default empty or default image URL
  profileDetail$ = this.profileDetailSource.asObservable();

  setProfileImage(profileDeatils: { firstName: string, lastName: string, profileImage: string; }) {
    this.profileDetailSource.next(profileDeatils);
  }
}
