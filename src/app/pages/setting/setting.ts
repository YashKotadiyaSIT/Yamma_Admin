import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-setting',
  standalone: false,
  templateUrl: './setting.html',
  styleUrl: './setting.scss',
})
export class Setting {
  // public Editor: any = ClassicEditor;
  CommissionForm: FormGroup;
  ReferralForm: FormGroup;

  activeTab: string = 'privacy'; // Default active tab
}
