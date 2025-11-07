import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavLogo } from './nav-logo';

describe('NavLogo', () => {
  let component: NavLogo;
  let fixture: ComponentFixture<NavLogo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavLogo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavLogo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
