import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotoristaPedidoDetalheComponent } from './motorista-pedido-detalhe.component';

describe('MotoristaPedidoDetalheComponent', () => {
  let component: MotoristaPedidoDetalheComponent;
  let fixture: ComponentFixture<MotoristaPedidoDetalheComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MotoristaPedidoDetalheComponent]
    });
    fixture = TestBed.createComponent(MotoristaPedidoDetalheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
