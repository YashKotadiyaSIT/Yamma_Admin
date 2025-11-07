import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StripeConfiguration } from './stripe-configuration';

describe('StripeConfiguration', () => {
  let component: StripeConfiguration;
  let fixture: ComponentFixture<StripeConfiguration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StripeConfiguration]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StripeConfiguration);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
