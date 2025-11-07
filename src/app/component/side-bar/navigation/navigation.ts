import { Component, EventEmitter, Output } from '@angular/core';
import { DattaConfig } from '../../../app-config';

@Component({
  selector: 'app-navigation',
  standalone: false,
  templateUrl: './navigation.html',
  styleUrl: './navigation.scss',
})
export class Navigation {
 // public props
 @Output() NavCollapse = new EventEmitter();
 @Output() NavCollapsedMob = new EventEmitter();
 navCollapsed: any;
 navCollapsedMob = false;
 windowWidth = window.innerWidth;

 // constructor
 constructor() {
   this.navCollapsed = this.windowWidth >= 992 ? DattaConfig.isCollapseMenu : false;
 }

 // public method
 navCollapse() {
   if (this.windowWidth >= 992) {
     this.navCollapsed = !this.navCollapsed;
     this.NavCollapse.emit();
   }
 }

 navCollapseMob() {
   if (this.windowWidth < 992) {
     this.NavCollapsedMob.emit();
   }
 }
}
