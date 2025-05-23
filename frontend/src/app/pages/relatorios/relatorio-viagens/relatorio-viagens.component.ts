import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TravelService } from '../../../services/travel.service';
import { Router, ActivatedRoute } from '@angular/router';


interface RelatorioTotais {
  totalViagens: number;
  totalHoras: number;
  totalKm: number;
}

@Component({
  selector: 'app-relatorio-viagens',
  templateUrl: './relatorio-viagens.component.html',
  styleUrls: ['./relatorio-viagens.component.css']
})
export class RelatorioViagensComponent implements OnInit {
  relatorioTotais: RelatorioTotais | null = null;
  periodoForm: FormGroup;
  erroRelatorio: string | null = null;

  constructor(
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
    const { inicio, fim } = this.periodoForm.value;
    const params: any = {};
    if (inicio) params.inicio = inicio;
    if (fim) params.fim = fim;
    this.viagemService.getRelatorioViagens(params).subscribe({
      next: (res) => {
        this.relatorioTotais = res.totais;
      },
      error: (err) => {
        this.erroRelatorio = 'Erro ao carregar relatório.';
        this.relatorioTotais = null;
      }
    });
  }

  verPorTaxis() {
    const { inicio, fim } = this.periodoForm.value;
    this.router.navigate(['/relatorios/taxis'], { queryParams: { inicio, fim } });
  }

  verPorMotoristas() {
    const { inicio, fim } = this.periodoForm.value;
    this.router.navigate(['/relatorios/motoristas'], { queryParams: { inicio, fim } });
  }

  voltarAtras() {
    this.router.navigate(['/']);
  }

  onPeriodoSubmit() {
    this.carregarRelatorio();
  }
}
