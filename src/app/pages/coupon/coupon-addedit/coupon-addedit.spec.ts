import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CouponAddedit } from './coupon-addedit';

describe('CouponAddedit', () => {
  let component: CouponAddedit;
  let fixture: ComponentFixture<CouponAddedit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CouponAddedit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CouponAddedit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
