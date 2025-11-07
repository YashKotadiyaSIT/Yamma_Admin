import { Component } from '@angular/core';

@Component({
  selector: 'app-nav-search',
  standalone: false,
  templateUrl: './nav-search.html',
  styleUrl: './nav-search.scss',
})
export class NavSearch {
  searchInterval: any;
  searchWidth: number;
  searchWidthString: string;

  constructor() {
    this.searchWidth = 0;
  }

  searchOn() {
    document.querySelector('#main-search').classList.add('open');
    this.searchInterval = setInterval(() => {
      if (this.searchWidth >= 170) {
        clearInterval(this.searchInterval);
        // return false;
      }
      this.searchWidth = this.searchWidth + 30;
      this.searchWidthString = this.searchWidth + 'px';
    }, 35);
  }

  searchOff() {
    this.searchInterval = setInterval(() => {
      if (this.searchWidth <= 0) {
        document.querySelector('#main-search').classList.remove('open');
        clearInterval(this.searchInterval);
        // return false;
      }
      this.searchWidth = this.searchWidth - 30;
      this.searchWidthString = this.searchWidth + 'px';
    }, 35);
  }
}
