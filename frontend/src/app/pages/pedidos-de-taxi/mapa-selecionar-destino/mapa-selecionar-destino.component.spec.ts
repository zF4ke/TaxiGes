import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaSelecionarDestinoComponent } from './mapa-selecionar-destino.component';

describe('MapaSelecionarDestinoComponent', () => {
  let component: MapaSelecionarDestinoComponent;
  let fixture: ComponentFixture<MapaSelecionarDestinoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MapaSelecionarDestinoComponent]
    });
    fixture = TestBed.createComponent(MapaSelecionarDestinoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
