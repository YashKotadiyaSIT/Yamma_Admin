import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
 private verificationStatus: number = 0;
  private searchData: string = '';

  getValue(key: string): any {
    return localStorage.getItem(key);
  }

  setValue(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  removeValue(key: string): void {
    localStorage.removeItem(key);
  }

  clearStorage():void{
    localStorage.clear();
  }

  setVerificationStatus(status: number) {
    this.verificationStatus = status;
  }

  getVerificationStatus(): number {
    return this.verificationStatus;
  }

  setSearchData(data: string) {
    this.searchData = data;
  }

  getSearchData(): string {
    return this.searchData;
  }

  clearData() {
    this.verificationStatus = 0;
    this.searchData = '';
  }
}
export class StorageKey {
  public static userId = 'userId'
  public static currentUser = 'currentUser';
  public static userfullname = 'userfullname';
  public static phone = "phone";
  public static authToken = 'authToken';
  public static expireDate:'expireDate';
  public static currentUserId = 'currentUserId';
  public static adminProfilePicture = 'adminProfilePicture';
}

