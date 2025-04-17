import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTaxiComponent } from './add-taxi.component';

describe('AddTaxiComponent', () => {
  let component: AddTaxiComponent;
  let fixture: ComponentFixture<AddTaxiComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddTaxiComponent]
    });
    fixture = TestBed.createComponent(AddTaxiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
