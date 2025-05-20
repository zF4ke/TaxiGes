import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MotoristaService } from '../../../services/motorista.service';
import { Motorista } from '../../../models/motorista.model';

interface RelatorioTotais {
  totalViagens: number;
  totalHoras: number;
  totalKm: number;
}

interface RelatorioMotorista {
  motorista: Motorista;
  viagens: number;
  horas: number;
  km: number;
}

@Component({
  selector: 'app-relatorio-motoristas',
  templateUrl: './relatorio-motoristas.component.html',
  styleUrls: ['./relatorio-motoristas.component.css']
})
export class RelatorioMotoristasComponent implements OnInit {
  relatorioTotais: RelatorioTotais | null = null;
  relatorioPorMotorista: RelatorioMotorista[] = [];
  periodoForm: FormGroup;
  erroRelatorio: string | null = null;
  relatorioSubtotais: { tipo: 'viagens' | 'horas' | 'km' | null, data: any[] } = { tipo: null, data: [] };

  constructor(private motoristaService: MotoristaService, private fb: FormBuilder) {
    this.periodoForm = this.fb.group({
      inicio: [''],
      fim: ['']
    });
  }

  ngOnInit() {
    this.carregarRelatorio();
  }

  carregarRelatorio() {
    this.erroRelatorio = null;
    const { inicio, fim } = this.periodoForm.value;
    const params: any = {};
    if (inicio) params.inicio = inicio;
    if (fim) params.fim = fim;
    this.motoristaService.getRelatorioMotoristas(params).subscribe({
      next: (res) => {
        this.relatorioTotais = res.totais;
        this.relatorioPorMotorista = res.porMotorista;
      },
      error: (err) => {
        this.erroRelatorio = 'Erro ao carregar relatório.';
        this.relatorioTotais = null;
        this.relatorioPorMotorista = [];
      }
    });
  }

  onPeriodoSubmit() {
    this.carregarRelatorio();
  }

  onTotalClick(tipo: 'viagens' | 'horas' | 'km') {
    // Ordenar decrescente e mostrar subtotais por motorista
    if (!this.relatorioPorMotorista) return;
    const data = [...this.relatorioPorMotorista].sort((a, b) => b[tipo] - a[tipo]);
    this.relatorioSubtotais = { tipo, data };
  }
}
