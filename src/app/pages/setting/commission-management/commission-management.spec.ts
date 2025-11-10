import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionManagement } from './commission-management';

describe('CommissionManagement', () => {
  let component: CommissionManagement;
  let fixture: ComponentFixture<CommissionManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CommissionManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommissionManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
