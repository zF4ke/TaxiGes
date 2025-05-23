import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatorioViagensComponent } from './relatorio-viagens.component';

describe('RelatorioViagensComponent', () => {
  let component: RelatorioViagensComponent;
  let fixture: ComponentFixture<RelatorioViagensComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RelatorioViagensComponent]
    });
    fixture = TestBed.createComponent(RelatorioViagensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
