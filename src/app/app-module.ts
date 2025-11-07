import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SharedModule } from './component/shared/shared-module';
import { Login } from './pages/auth/login/login';
import { NavBar } from './component/side-bar/nav-bar/nav-bar';
import { NavLeft } from './component/side-bar/nav-bar/nav-left/nav-left';
import { NavSearch } from './component/side-bar/nav-bar/nav-left/nav-search/nav-search';
import { NavRight } from './component/side-bar/nav-bar/nav-right/nav-right';
import { NavCollapse } from './component/side-bar/navigation/nav-content/nav-collapse/nav-collapse';
import { NavContent } from './component/side-bar/navigation/nav-content/nav-content';
import { NavGroup } from './component/side-bar/navigation/nav-content/nav-group/nav-group';
import { NavItem } from './component/side-bar/navigation/nav-content/nav-item/nav-item';
import { NavLogo } from './component/side-bar/navigation/nav-logo/nav-logo';
import { Navigation } from './component/side-bar/navigation/navigation';
import { Main } from './layout/main/main';
import { ToastrModule } from 'ngx-toastr';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ToggleFullScreenDirective } from './component/full-screen/toggle-full-screen';
import { AuthInterceptor } from './interceptor/AuthInterceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavigationItem } from './component/side-bar/navigation/navigation-item';

@NgModule({
  declarations: [
    App,
    Main,
    Login,
    NavBar,
    NavLeft,
    NavSearch,
    NavRight,
    Navigation,
    NavContent,
    NavCollapse,
    NavGroup,
    NavItem,
    NavLogo
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    SharedModule,
    ToggleFullScreenDirective,
    NgxSpinnerModule.forRoot({ type: 'ball-scale-multiple' }),
    ToastrModule.forRoot()
],
  providers: [
    NavigationItem,
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [App]
})
export class AppModule { }
