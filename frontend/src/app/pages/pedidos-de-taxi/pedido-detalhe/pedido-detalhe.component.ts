import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PedidoService } from '../../../services/pedido.service';
import { Pedido } from '../../../models/pedido.model';
import { TurnoService } from '../../../services/turno.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { interval, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { TravelService } from 'src/app/services/travel.service';
import { TaxiService } from '../../../services/taxi.service';
import { Taxi } from '../../../models/taxi.model';
import { Turno } from 'src/app/models/turno.model';
import { PrecoService, SimulationResult } from '../../../services/preco.service';
import { GeocodingService } from '../../../services/geocoding.service';
import { haversineKm, Coordenadas } from 'src/app/utils/haversine.util';

@Component({
  selector: 'app-pedido-detalhe',
  templateUrl: './pedido-detalhe.component.html',
  styleUrls: ['./pedido-detalhe.component.css']
})
export class PedidoDetalheComponent implements OnInit, OnDestroy {
  pedido?: Pedido;
  taxiSelecionado?: Taxi;
  private pedidoId!: string;
  private viagemCriada = false;
  distanciaKm?: number;
  duracaoMin?: number;
  precoEstimado?: number;
  isCalculating = false;

  constructor(
    private route: ActivatedRoute,
    private pedidoService: PedidoService,
    private snackBar: MatSnackBar,
    private turnoService: TurnoService,
    private router: Router,
    private precoService: PrecoService,
    private geocodingService: GeocodingService
  ) {}

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.pedidoId = this.route.snapshot.paramMap.get('id')!;
    this.loadPedido();

    interval(5000).pipe(
      takeUntil(this.destroy$),
      switchMap(() => this.pedidoService.getPedido(this.pedidoId))
    ).subscribe({
      next: (p) => {
        const motoristaChanged = p.motoristaSelecionado?._id !== this.pedido?.motoristaSelecionado?._id;
        this.pedido = p;
        if (p.motoristaSelecionado) {
          // Sempre buscar turno e calcular se mudou o motorista ou se ainda não temos taxiSelecionado
          if (motoristaChanged || !this.taxiSelecionado) {
            this.turnoService.getTurnoAtivo(p.motoristaSelecionado._id).subscribe({
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
        } else {
          this.taxiSelecionado = undefined;
        }
      },
      error: err => this.snackBar.open('Erro ao atualizar pedido', 'Fechar', { duration: 3000 })
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPedido() {
    this.pedidoService.getPedido(this.pedidoId).subscribe({
      next: p => {
        this.pedido = p;
        // Se houver motorista selecionado, buscar info do taxi
        if (p.motoristaSelecionado) {
          console.log('Motorista selecionado:', p.motoristaSelecionado);
          console.log('A buscar turno ativo para o motorista e a calcular distância e preço...');
          this.turnoService.getTurnoAtivo(p.motoristaSelecionado._id).subscribe({
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
        } else {
          this.taxiSelecionado = undefined;
        }
        console.log(this.pedido)
      },
      error: err => this.snackBar.open('Erro ao carregar pedido', 'Fechar', { duration: 3000 })
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

  onConfirmarMotorista() {
    if (!this.pedido) return;
    this.pedidoService.aceitarMotorista(this.pedido._id!).subscribe({
      next: () => {
        this.snackBar.open('Motorista confirmado!', 'Fechar', { duration: 3000 });
        //this.verificarCriacaoViagem();
      },
      error: err => this.snackBar.open('Erro ao confirmar motorista', 'Fechar', { duration: 3000 })
    });
  }

  onRejeitarMotorista() {
    if (!this.pedido || !this.pedido.motoristaSelecionado) return;
    this.pedidoService.rejeitarMotorista(this.pedido._id!, this.pedido.motoristaSelecionado._id).subscribe({
      next: () => {
        this.snackBar.open('Motorista rejeitado.', 'Fechar', { duration: 3000 });
        this.loadPedido();
      },
      error: err => this.snackBar.open('Erro ao rejeitar motorista', 'Fechar', { duration: 3000 })
    });
  }

  onCancelar(): void {
    if (!this.pedido?._id) return;

    this.pedidoService.cancelPedido(this.pedido._id).subscribe({
      next: () => {
        this.snackBar.open('Pedido cancelado com sucesso.', 'Fechar', { duration: 3000 });
        this.router.navigate(['/']);
      },
      error: err => {
        console.error('Erro ao cancelar pedido:', err);
        this.snackBar.open('Erro ao cancelar pedido.', 'Fechar', { duration: 3000 });
      }
    });
  }
}
