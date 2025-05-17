import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidoTaxiComponent } from './pedido-taxi.component';

describe('PedidoTaxiComponent', () => {
  let component: PedidoTaxiComponent;
  let fixture: ComponentFixture<PedidoTaxiComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PedidoTaxiComponent]
    });
    fixture = TestBed.createComponent(PedidoTaxiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
