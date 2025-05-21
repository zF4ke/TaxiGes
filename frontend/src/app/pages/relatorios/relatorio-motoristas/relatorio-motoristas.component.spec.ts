import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatorioMotoristasComponent } from './relatorio-motoristas.component';

describe('RelatorioMotoristasComponent', () => {
  let component: RelatorioMotoristasComponent;
  let fixture: ComponentFixture<RelatorioMotoristasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RelatorioMotoristasComponent]
    });
    fixture = TestBed.createComponent(RelatorioMotoristasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
