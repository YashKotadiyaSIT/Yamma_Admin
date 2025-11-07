import { Component } from '@angular/core';

interface ActionButton {
  text?: string;
  icon?: string;  // font icons
  img?: string;   // image icons
  alt?: string;   // alt text for img
  class?: string;
  action: (rowData: any) => void;
}

@Component({
  selector: 'app-action-button-renderer',
  standalone: true,
  imports: [],
  templateUrl: './action-button-renderer.html',
  styleUrl: './action-button-renderer.scss',
})
export class ActionButtonRenderer {
  params: any;
  buttons: ActionButton[] = [];

  agInit(params: any): void {
    this.params = params;
    this.buttons = params?.buttons || [];
  }

  refresh(params: any): boolean {
    this.params = params;
    this.buttons = params?.buttons || [];
    return true;
  }

  onButtonClick(button: ActionButton) {
    if (button.action) {
      button.action(this.params.data);
    }
  }
}
