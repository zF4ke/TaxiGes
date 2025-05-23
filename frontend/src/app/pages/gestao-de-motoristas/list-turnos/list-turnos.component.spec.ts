import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTurnosComponent } from './list-turnos.component';

describe('ListTurnosComponent', () => {
  let component: ListTurnosComponent;
  let fixture: ComponentFixture<ListTurnosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListTurnosComponent]
    });
    fixture = TestBed.createComponent(ListTurnosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
