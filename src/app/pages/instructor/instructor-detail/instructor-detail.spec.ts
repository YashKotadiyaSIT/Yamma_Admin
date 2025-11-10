import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorDetail } from './instructor-detail';

describe('InstructorDetail', () => {
  let component: InstructorDetail;
  let fixture: ComponentFixture<InstructorDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InstructorDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructorDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
