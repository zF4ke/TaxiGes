import { Component, OnInit } from '@angular/core';
import { TaxiService } from '../../../services/taxi.service';
import { Taxi } from '../../../models/taxi.model';
import { FormBuilder, FormGroup } from '@angular/forms';

interface RelatorioTotais {
  totalViagens: number;
  totalHoras: number;
  totalKm: number;
}

interface RelatorioTaxi {
  taxi: Taxi;
  viagens: number;
  horas: number;
  km: number;
}

@Component({
  selector: 'app-relatorio-taxis',
  templateUrl: './relatorio-taxis.component.html',
  styleUrls: ['./relatorio-taxis.component.css']
})
export class RelatorioTaxisComponent implements OnInit {
  relatorioTotais: RelatorioTotais | null = null;
  relatorioPorTaxi: RelatorioTaxi[] = [];
  periodoForm: FormGroup;
  erroRelatorio: string | null = null;
  relatorioSubtotais: { tipo: 'viagens' | 'horas' | 'km' | null, data: any[] } = { tipo: null, data: [] };

  constructor(private taxiService: TaxiService, private fb: FormBuilder) {
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
    this.taxiService.getRelatorioTaxis(params).subscribe({
      next: (res) => {
        this.relatorioTotais = res.totais;
        this.relatorioPorTaxi = res.porTaxi;
      },
      error: (err) => {
        this.erroRelatorio = 'Erro ao carregar relatório.';
        this.relatorioTotais = null;
        this.relatorioPorTaxi = [];
      }
    });
  }

  onPeriodoSubmit() {
    this.carregarRelatorio();
  }

  onTotalClick(tipo: 'viagens' | 'horas' | 'km') {
    // Ordenar decrescente e mostrar subtotais por táxi
    if (!this.relatorioPorTaxi) return;
    const data = [...this.relatorioPorTaxi].sort((a, b) => b[tipo] - a[tipo]);
    this.relatorioSubtotais = { tipo, data };
  }
}
