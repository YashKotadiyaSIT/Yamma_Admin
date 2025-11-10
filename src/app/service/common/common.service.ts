import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Observable, catchError, tap, Subject, BehaviorSubject, throwError, share, of } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from '../../../environments/environment';
import { jwtDecode } from "jwt-decode";
import { FormGroup } from '@angular/forms';
import { ApiResponse } from '../../models/commonModel';
import { StorageService } from '../storage/storage.service';
import { ErrorMessageConstants, TokenConstants } from '../../common/Constants/LabelConstants';
import { ApiUrlHelper } from '../../common/api-url-helper';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class CommonService {

  public DateFormatString = "dd/MM/yyyy";
  public DateTimeFormatString = "dd/MM/yyyy hh:mm:ss tt";

  public emailRegex: RegExp = /^(?=.{1,30}@)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  private readonly userImageSource = new BehaviorSubject<string | null>(null);
  private readonly userNameSource = new BehaviorSubject<string | null>(null);

  userName$ = this.userNameSource.asObservable();
  userImage$ = this.userImageSource.asObservable();

  setAutoHide: boolean = true;
  autoHide: number = 2000;
  private logoutSubject = new Subject<void>();
  public logoutAction$ = this.logoutSubject.asObservable();
  public ActiveModelformGroup: FormGroup | undefined;
  public href: any;
  IsError: boolean = false;
  isSystemAlert: boolean = false;

  constructor(
    private readonly toster: ToastrService,
    private readonly spinner: NgxSpinnerService,
    private apiUrl: ApiUrlHelper,
    private router: Router,
    private readonly http: HttpClient,
    private readonly storageService: StorageService
  ) { }

  doGet(apiUrl: string): Observable<ApiResponse> {
    const url = `${environment.BaseURL}${apiUrl}`;
    return this.http.get<ApiResponse>(url).pipe(
      tap(() => this.log(`doGet success`)),
      catchError((error: HttpErrorResponse) => {
        // Only handle non-401 errors here
        this.checkAuthorize(error);
        return of(); // let interceptor handle 401
      })
    );
  }

  doPost(apiUrl: string, postData: any): Observable<ApiResponse> {
    const url = `${environment.BaseURL}${apiUrl}`;
    return this.http.post<ApiResponse>(url, postData).pipe(
      tap(() => this.log(`doPost success`)),
      catchError((error: HttpErrorResponse) => {
        this.checkAuthorize(error);
        return of();
      })
    );
  }

  doPostwithCredentials(apiUrl: string, postData: any): Observable<ApiResponse> {
    const url = `${environment.BaseURL}${apiUrl}`;
    return this.http.post<ApiResponse>(url, postData, { withCredentials: true }).pipe(
      tap(() => this.log(`doPost success`)),
      catchError((error: HttpErrorResponse) => {
        this.checkAuthorize(error);
        return of();
      })
    );
  }

  doPut(apiUrl: string, putData: any): Observable<ApiResponse> {
    const url = `${environment.BaseURL}${apiUrl}`;
    return this.http.put<ApiResponse>(url, putData).pipe(
      tap(() => this.log(`doPut success`)),
      catchError((error: HttpErrorResponse) => {
        this.checkAuthorize(error);
        return of();
      })
    );
  }

  doDelete(apiUrl: string, idtoDelete: any): Observable<ApiResponse> {
    const url = `${environment.BaseURL}${apiUrl}`;
    return this.http.delete<ApiResponse>(url).pipe(
      tap(() => this.log(`doDelete success`)),
      catchError((error: HttpErrorResponse) => {
        this.checkAuthorize(error);
        return of();
      })
    );
  }

  doDownloadPost(apiUrl: string, postData: any) {
    const url = `${environment.BaseURL}${apiUrl}`;
    return this.http.post(url, postData, { observe: "response", responseType: "blob" });
  }

  doReportPost(apiUrl: string, postData: any): Observable<any> {
    const url = `${environment.BaseURL}${apiUrl}`;
    return this.http.post<any>(url, postData).pipe(
      tap(() => this.log(`doPost success`)),
      catchError((error: HttpErrorResponse) => {
        this.checkAuthorize(error);
        return of();
      })
    );
  }

  downloadFilePost(apiUrl: string, postData: any): Observable<Blob> {
    const url = `${environment.BaseURL}${apiUrl}`;
    return this.http.post<Blob>(url, postData,
      {
        responseType: 'blob' as 'json'
      }).pipe(
        share() // Add the share operator here if needed
      );
  }

  // Check Authorize Role
  checkAuthorize(error: any) {
    if (error.status == HttpStatusCode.Unauthorized) {
      if (this.IsError == false) {
        this.IsError = true
        this.toster.error(TokenConstants.Session_Expired);
      }
      this.spinner.hide();
      this.logout();
    }
    else if (error.status == HttpStatusCode.Forbidden) {
      if (this.IsError == false) {
        this.IsError = true
        this.toster.error(TokenConstants.Session_Expired);
        this.storageService.clearStorage();
      }
      this.logout();
      this.spinner.hide();
    }
    else if (error.status === HttpStatusCode.InternalServerError) {
      this.toster.error(ErrorMessageConstants.Message)
      this.logout();
      this.spinner.hide();
    }
    else {
      var errorMessage = (error.error.message != null) ? error.error.message : error.message
    }
  }

  private log(message: string) {
    this.IsError = false;
  }

  setUserName(name: string | null) {
    this.userNameSource.next(name);
  }

  getUserName(): Observable<string | null> {
    return this.userName$;
  }

  setUserImage(imageSrc: string | null) {
    this.userImageSource.next(imageSrc);
  }

  getUserImage(): Observable<string | null> {
    return this.userImage$;
  }

  private formSubmittedSubject = new BehaviorSubject<boolean>(false);
  formSubmitted$ = this.formSubmittedSubject.asObservable();

  setFormSubmitted(value: boolean): void {
    this.formSubmittedSubject.next(value);
  }

  getFormSubmitted(): boolean {
    return this.formSubmittedSubject.value;
  }

  Encrypt(input: string): string {
    try {
      return encodeURIComponent(btoa(unescape(input)));
    } catch (e) {
      console.error('Encoding failed', e);
      return '';
    }
  }

  Decrypt(encoded: string): string {
    try {
      return escape(atob(decodeURIComponent(encoded)));
    } catch (e) {
      console.error('Decoding failed', e);
      return '';
    }
  }

  decodeJwt(value: string) {
    try {
      return jwtDecode(value);
    } catch (error) {
      return null;
    }
  }

  getTimeZone() {
    const timezoneOffset = new Date().getTimezoneOffset();
    const offset = Math.abs(timezoneOffset);
    const offsetOperator = timezoneOffset < 0 ? '+' : '-';
    const offsetHours = Math.floor(offset / 60).toString().padStart(2, '0');
    const offsetMinutes = Math.floor(offset % 60).toString().padStart(2, '0');
    return `${offsetOperator}${offsetHours}:${offsetMinutes}`;
  }

  logout() {
    
    if (localStorage.getItem("authToken") == null || localStorage.getItem("authToken") == undefined || localStorage.getItem("authToken") == "") {
      return;
    }
    
    let apiUrl = this.apiUrl.apiUrl.Login.logout;
    this.doPost(apiUrl, {}).pipe().subscribe({
        next: (response) => {
          if (response.success) {
            this.storageService.clearStorage();
            this.router.navigate(['/login']);
          }
          else {
            this.storageService.clearStorage();
            this.router.navigate(['/login']);
          }
        },
        error: (err) => {
          this.storageService.clearStorage();
            this.router.navigate(['/login']);
        }
      });
  }
}