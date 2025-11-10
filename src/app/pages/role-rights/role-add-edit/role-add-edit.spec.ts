import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleAddEdit } from './role-add-edit';

describe('RoleAddEdit', () => {
  let component: RoleAddEdit;
  let fixture: ComponentFixture<RoleAddEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RoleAddEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleAddEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
