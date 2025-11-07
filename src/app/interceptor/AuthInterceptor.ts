import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, throwError, switchMap, of, finalize } from "rxjs";
import { AuthService } from "../service/authService/auth.service";
import { NgxSpinnerService } from "ngx-spinner";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private readonly authService: AuthService,
    private readonly spinner: NgxSpinnerService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getAccessToken();
    let authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        this.spinner.hide();
        if (error.status === 401 || error.status === 403) {
          this.authService.logout();
        }
        return throwError(() => error);
      }),
      finalize(() => {
        this.spinner.hide();
      })
    );
  }
}
