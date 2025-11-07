import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-nav-bar',
  standalone: false,
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.scss',
})
export class NavBar {
 // public props
 @Output() NavCollapsedMob = new EventEmitter();
 navCollapsedMob = false;
 headerStyle: string = '';
 menuClass: boolean = false;
 collapseStyle: string = 'none';

 // public method
 toggleMobOption() {
   this.menuClass = !this.menuClass;
   this.headerStyle = this.menuClass ? 'none' : '';
   this.collapseStyle = this.menuClass ? 'block' : 'none';
 }
}
