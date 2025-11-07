import { Component, Input } from '@angular/core';
import { NavigationItem } from '../../navigation-item';
import { Location } from '@angular/common';

@Component({
  selector: 'app-nav-group',
  standalone: false,
  templateUrl: './nav-group.html',
  styleUrl: './nav-group.scss',
})
export class NavGroup {
// public props
@Input() item: NavigationItem;

// constructor
constructor(private location: Location) {}

// life cycle event
ngOnInit() {
  let current_url = this.location.path();
  if (this.location['_baseHref']) {
    current_url = this.location['_baseHref'] + this.location.path();
  }
  const link = "a.nav-link[ href='" + current_url + "' ]";
  const ele = document.querySelector(link);
  if (ele !== null && ele !== undefined) {
    const parent = ele.parentElement;
    const up_parent = parent.parentElement.parentElement;
    const last_parent = up_parent.parentElement;
    if (parent.classList.contains('pcoded-hasmenu')) {
      parent.classList.add('pcoded-trigger');
      parent.classList.add('active');
    } else if (up_parent.classList.contains('pcoded-hasmenu')) {
      up_parent.classList.add('pcoded-trigger');
      up_parent.classList.add('active');
    } else if (last_parent.classList.contains('pcoded-hasmenu')) {
      last_parent.classList.add('pcoded-trigger');
      last_parent.classList.add('active');
    }
  }
}
}
