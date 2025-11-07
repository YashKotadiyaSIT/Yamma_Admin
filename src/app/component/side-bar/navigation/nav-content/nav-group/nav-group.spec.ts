import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavGroup } from './nav-group';

describe('NavGroup', () => {
  let component: NavGroup;
  let fixture: ComponentFixture<NavGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavGroup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavGroup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
