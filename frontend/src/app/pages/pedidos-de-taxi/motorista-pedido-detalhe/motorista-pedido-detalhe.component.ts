import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PedidoService } from '../../../services/pedido.service';
import { Pedido } from '../../../models/pedido.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { interval, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { PrecoService, SimulationResult } from '../../../services/preco.service';
import { GeocodingService } from '../../../services/geocoding.service';
import { haversineKm, Coordenadas } from 'src/app/utils/haversine.util';
import { TurnoService } from '../../../services/turno.service';
import { Taxi } from '../../../models/taxi.model';
import { Turno } from '../../../models/turno.model';

@Component({
  selector: 'app-motorista-pedido-detalhe',
  templateUrl: './motorista-pedido-detalhe.component.html',
  styleUrls: ['./motorista-pedido-detalhe.component.css']
})
export class MotoristaPedidoDetalheComponent implements OnInit, OnDestroy {
  pedido!: Pedido;
  isLoading = true;
  private destroy$ = new Subject<void>();
  taxiSelecionado?: Taxi;
  distanciaKm?: number;
  duracaoMin?: number;
  precoEstimado?: number;
  isCalculating = false;

  constructor(
    private route: ActivatedRoute,
    private pedidoService: PedidoService,
    private snackBar: MatSnackBar,
    private router: Router,
    private precoService: PrecoService,
    private geocodingService: GeocodingService,
    private turnoService: TurnoService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.pedidoService.getPedido(id).subscribe({
        next: data => {
          this.pedido = data;
          this.isLoading = false;
          if (data.motoristaSelecionado) {
            this.buscarTurnoETaxi(data.motoristaSelecionado._id);
          }
        },
        error: (err: any) => {
          this.snackBar.open('Erro ao carregar pedido.', 'Fechar', { duration: 3000 });
          this.router.navigate(['/list-pedidos']);
        }
      });
      // Polling a cada 5s
      interval(5000).pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.pedidoService.getPedido(id))
      ).subscribe({
        next: data => {
          const motoristaChanged = data.motoristaSelecionado?._id !== this.pedido?.motoristaSelecionado?._id;
          this.pedido = data;
          if (data.motoristaSelecionado && (motoristaChanged || !this.taxiSelecionado)) {
            this.buscarTurnoETaxi(data.motoristaSelecionado._id);
          }
        },
        error: (err: any) => {
          this.snackBar.open('Erro ao atualizar pedido.', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  private buscarTurnoETaxi(motoristaId: string) {
    this.turnoService.getTurnoAtivo(motoristaId).subscribe({
      next: (turno: Turno) => {
        if (turno && turno.taxi) {
          this.taxiSelecionado = turno.taxi;
          this.calcularDistanciaEPreco();
        } else {
          this.taxiSelecionado = undefined;
        }
      },
      error: () => this.taxiSelecionado = undefined
    });
  }

  private calcularDistanciaEPreco() {
    if (!this.pedido?.localizacaoAtual || !this.pedido?.destino || !this.taxiSelecionado) {
      this.distanciaKm = undefined;
      this.duracaoMin = undefined;
      this.precoEstimado = undefined;
      return;
    }
    this.isCalculating = true;
    Promise.all([
      this.geocodingService.geocode(this.pedido.localizacaoAtual).toPromise(),
      this.geocodingService.geocode(this.pedido.destino).toPromise()
    ]).then(([origemCoords, destinoCoords]) => {
      if (!origemCoords || !destinoCoords) {
        this.distanciaKm = undefined;
        this.duracaoMin = undefined;
        this.precoEstimado = undefined;
        this.isCalculating = false;
        return;
      }
      this.distanciaKm = haversineKm(origemCoords, destinoCoords);
      this.duracaoMin = Math.round(this.distanciaKm * 4); // 4 min/km (como viagem)
      // Simular preço
      const now = new Date();
      const horaInicial = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
      const horaFinalDate = new Date(now.getTime() + this.duracaoMin * 60000);
      const horaFinal = horaFinalDate.getHours().toString().padStart(2, '0') + ':' + horaFinalDate.getMinutes().toString().padStart(2, '0');
      this.precoService.simulateTravel({
        tipo: this.taxiSelecionado?.conforto || 'básico',
        horaInicial,
        horaFinal
      }).subscribe({
        next: (result: SimulationResult) => {
          this.precoEstimado = result.preco;
          this.isCalculating = false;
        },
        error: () => {
          this.precoEstimado = undefined;
          this.isCalculating = false;
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
