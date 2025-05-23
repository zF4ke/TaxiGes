import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelRegisterComponent } from './travel-register.component';

describe('TravelRegisterComponent', () => {
  let component: TravelRegisterComponent;
  let fixture: ComponentFixture<TravelRegisterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TravelRegisterComponent]
    });
    fixture = TestBed.createComponent(TravelRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
