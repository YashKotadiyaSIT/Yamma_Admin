import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAddedit } from './user-addedit';

describe('UserAddedit', () => {
  let component: UserAddedit;
  let fixture: ComponentFixture<UserAddedit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserAddedit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserAddedit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
