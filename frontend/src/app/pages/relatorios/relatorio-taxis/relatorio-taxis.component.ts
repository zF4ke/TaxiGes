import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TaxiService } from '../../../services/taxi.service';
import { TravelService } from '../../../services/travel.service';
import { Taxi } from '../../../models/taxi.model';
import { Router, ActivatedRoute } from '@angular/router';

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
  detailsTaxi: any = null;
  loadingDetalhes = false;
  viagensDetalhe: any[] = [];

  constructor(
    private taxiService: TaxiService,
    private viagemService: TravelService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute) {
    this.periodoForm = this.fb.group({
      inicio: [''],
      fim: ['']
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['inicio']) this.periodoForm.get('inicio')?.setValue(params['inicio']);
      if (params['fim']) this.periodoForm.get('fim')?.setValue(params['fim']);
      this.carregarRelatorio();
    });
  }

  carregarRelatorio() {
    this.erroRelatorio = null;
    this.detailsTaxi = null;
    this.relatorioSubtotais = { tipo: null, data: [] };
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

  mostrarDetalhesTaxi(taxi: any) {
    this.detailsTaxi = taxi;
    this.loadingDetalhes = true;
    const { inicio, fim } = this.periodoForm.value;

    this.viagemService.getViagensPorTaxi(taxi._id).subscribe({
      next: (viagens) => {
        // Filtra pelo período se especificado
        const dataInicio = inicio ? new Date(inicio + 'T00:00:00') : null;
        const dataFim = fim ? new Date(fim + 'T23:59:59') : null;
        this.viagensDetalhe = viagens
          .filter(v => {
            const dataViagem = new Date(v.inicio);
            return (!dataInicio || dataViagem >= dataInicio) &&
                   (!dataFim || dataViagem <= dataFim);
          })
          .sort((a, b) => new Date(b.inicio).getTime() - new Date(a.inicio).getTime());
        this.loadingDetalhes = false;
      },
      error: () => {
        this.viagensDetalhe = [];
        this.loadingDetalhes = false;
      }
    });
  }

  calcularHorasViagem(viagem: any): number {
    if (!viagem.inicio || !viagem.fim) return 0;
    const inicio = new Date(viagem.inicio).getTime();
    const fim = new Date(viagem.fim).getTime();
    return (fim - inicio) / 3600000;
  }

  voltarRelatorioViagens() {
    const { inicio, fim } = this.periodoForm.value;
    this.router.navigate(['/relatorios/viagens'], { queryParams: { inicio, fim } });
  }

  voltarAtras() {
    this.router.navigate(['/']);
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
  getDetailColumns(): string[] {
    const baseColumns = ['inicio', 'horario'];
    if (this.relatorioSubtotais.tipo === 'horas') {
      return [...baseColumns, 'horas'];
    } else if (this.relatorioSubtotais.tipo === 'km') {
      return [...baseColumns, 'km'];
    } else if (this.relatorioSubtotais.tipo === 'viagens') {
      return [...baseColumns, 'rota'];
    }
    return baseColumns;
  }
}
