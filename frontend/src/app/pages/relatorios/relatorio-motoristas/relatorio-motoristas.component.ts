import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MotoristaService } from '../../../services/motorista.service';
import { TravelService } from '../../../services/travel.service';
import { Motorista } from '../../../models/motorista.model';
import { Viagem } from '../../../models/viagem.model';
import { Router, ActivatedRoute } from '@angular/router';

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

  detailsMotorista: Motorista | null = null;
  viagensDetalhe: Viagem[] = [];
  loadingDetalhes = false;

  constructor(
    private motoristaService: MotoristaService,
    private travelService: TravelService, 
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
    this.detailsMotorista = null;
    this.relatorioSubtotais = { tipo: null, data: [] };
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
    // Ordenar decrescente e mostrar subtotais por motorista
    if (!this.relatorioPorMotorista) return;
    const data = [...this.relatorioPorMotorista].sort((a, b) => b[tipo] - a[tipo]);
    this.relatorioSubtotais = { tipo, data };
  }

  mostrarDetalhesMotorista(motorista: Motorista) {
    this.detailsMotorista = motorista;
    this.loadingDetalhes = true;
    const { inicio, fim } = this.periodoForm.value;
    
    this.travelService.getViagensPorMotorista(motorista._id).subscribe({
      next: (viagens) => {
        // Filtrar viagens por data se o período estiver selecionado
        this.viagensDetalhe = viagens.filter(v => {
          if (!inicio && !fim) return true;
          const dataViagem = new Date(v.inicio).toISOString().slice(0, 10);
          if (inicio && dataViagem < inicio) return false;
          if (fim && dataViagem > fim) return false;
          return true;
        });
        this.loadingDetalhes = false;
      },
      error: (err) => {
        console.error('Erro ao carregar viagens do motorista:', err);
        this.viagensDetalhe = [];
        this.loadingDetalhes = false;
      }
    });
  }

  calcularHorasViagem(viagem: Viagem): number {
    const inicio = new Date(viagem.inicio);
    const fim = viagem.fim ? new Date(viagem.fim) : new Date();
    const diffMs = fim.getTime() - inicio.getTime();
    return Number((diffMs / (1000 * 60 * 60)).toFixed(2));
  }
  getDetailColumns(): string[] {
    const baseCols = ['inicio', 'horario'];
    switch (this.relatorioSubtotais.tipo) {
      case 'horas':
        return [...baseCols, 'horas'];
      case 'km':
        return [...baseCols, 'km'];
      case 'viagens':
        return [...baseCols, 'rota'];
      default:
        return baseCols;
    }
  }
}