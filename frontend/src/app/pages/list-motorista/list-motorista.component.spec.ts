import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMotoristaComponent } from './list-motorista.component';

describe('ListMotoristaComponent', () => {
  let component: ListMotoristaComponent;
  let fixture: ComponentFixture<ListMotoristaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListMotoristaComponent]
    });
    fixture = TestBed.createComponent(ListMotoristaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
