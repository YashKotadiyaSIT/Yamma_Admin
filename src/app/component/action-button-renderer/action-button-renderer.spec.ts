import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionButtonRenderer } from './action-button-renderer';

describe('ActionButtonRenderer', () => {
  let component: ActionButtonRenderer;
  let fixture: ComponentFixture<ActionButtonRenderer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActionButtonRenderer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionButtonRenderer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
