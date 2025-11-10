import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotDetails } from './slot-details';

describe('SlotDetails', () => {
  let component: SlotDetails;
  let fixture: ComponentFixture<SlotDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SlotDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlotDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
