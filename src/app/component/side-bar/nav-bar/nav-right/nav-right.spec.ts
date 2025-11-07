import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavRight } from './nav-right';

describe('NavRight', () => {
  let component: NavRight;
  let fixture: ComponentFixture<NavRight>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavRight]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavRight);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
