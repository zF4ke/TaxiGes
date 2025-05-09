import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Pedido } from '../../models/pedido.model';
import { PedidoService } from '../../services/pedido.service';
import { Subscription, interval, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { haversineKm, Coordenadas } from '../../utils/haversine.util';
import { GeocodingService } from 'src/app/services/geocoding.service';

@Component({
  selector: 'app-pedido-detalhe',
  templateUrl: './pedido-detalhe.component.html',
  styleUrls: ['./pedido-detalhe.component.css']
})
export class PedidoDetalheComponent implements OnInit, OnDestroy {
  pedido?: Pedido;
  distanciaKm?: number;
  tempoEstimadoMin?: number;
  custoEstimado?: number;
  private pedidoId!: string;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pedidoService: PedidoService,
    private snackBar: MatSnackBar,
    private geocodingService: GeocodingService
  ) {}

  ngOnInit(): void {
    this.pedidoId = this.route.snapshot.paramMap.get('id')!;

    interval(5000).pipe(
      takeUntil(this.destroy$),
      switchMap(() => this.pedidoService.getPedido(this.pedidoId))
    ).subscribe(p => this.processarPedido(p));

    this.pedidoService.getPedido(this.pedidoId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(p => this.processarPedido(p));
  }

  private processarPedido(p: Pedido): void {
    this.pedido = p;

    this.geocodingService.geocode(p.localizacaoAtual).subscribe(origCoords => {
      if (!origCoords) return;

      this.geocodingService.geocode(p.destino).subscribe(destCoords => {
        if (!destCoords) return;

        const from: Coordenadas = { latitude: origCoords.latitude, longitude: origCoords.longitude };
        const to: Coordenadas = { latitude: destCoords.latitude, longitude: destCoords.longitude };

        this.distanciaKm = parseFloat(haversineKm(from, to).toFixed(2));
        this.tempoEstimadoMin = Math.round(this.distanciaKm * 4);
        this.custoEstimado = parseFloat((0.5 * this.distanciaKm + 3).toFixed(2));

        console.log('Distância:', this.distanciaKm, 'km');
        console.log('Tempo estimado:', this.tempoEstimadoMin, 'min');
        console.log('Custo estimado:', this.custoEstimado, '€');
      });
    });
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCancelar(): void {
    if (!this.pedidoId) return;
    this.pedidoService.cancelPedido(this.pedidoId).subscribe(() => {
      this.router.navigate(['/']);
    });
  }

  onRejeitarMotorista(): void {
    if (!this.pedido || !this.pedido._id || !this.pedido.motoristaSelecionado?._id) return;

    this.pedidoService.rejeitarMotorista(this.pedido._id, this.pedido.motoristaSelecionado._id).subscribe({
      next: pedidoAtualizado => {
        this.pedido = pedidoAtualizado;
        this.snackBar.open('Motorista rejeitado com sucesso.', 'Fechar', { duration: 3000 });
      },
      error: err => {
        console.error(err);
        this.snackBar.open('Erro ao rejeitar motorista.', 'Fechar', { duration: 3000 });
      }
    });
  }
}
