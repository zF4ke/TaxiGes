import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequisitarTaxiTurnoComponent } from './requisitar-taxi-turno.component';

describe('RequisitarTaxiTurnoComponent', () => {
  let component: RequisitarTaxiTurnoComponent;
  let fixture: ComponentFixture<RequisitarTaxiTurnoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RequisitarTaxiTurnoComponent]
    });
    fixture = TestBed.createComponent(RequisitarTaxiTurnoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
