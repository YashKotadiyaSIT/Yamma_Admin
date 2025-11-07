import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavLeft } from './nav-left';

describe('NavLeft', () => {
  let component: NavLeft;
  let fixture: ComponentFixture<NavLeft>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavLeft]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavLeft);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
