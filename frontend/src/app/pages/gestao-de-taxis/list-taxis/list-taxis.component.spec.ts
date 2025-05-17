import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTaxisComponent } from './list-taxis.component';

describe('ListTaxisComponent', () => {
  let component: ListTaxisComponent;
  let fixture: ComponentFixture<ListTaxisComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListTaxisComponent]
    });
    fixture = TestBed.createComponent(ListTaxisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
