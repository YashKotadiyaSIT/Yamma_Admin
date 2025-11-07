import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavCollapse } from './nav-collapse';

describe('NavCollapse', () => {
  let component: NavCollapse;
  let fixture: ComponentFixture<NavCollapse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavCollapse]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavCollapse);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
