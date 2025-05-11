import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PedidoService } from '../../services/pedido.service';
import { Pedido } from '../../models/pedido.model';
import { TurnoService } from '../../services/turno.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { interval, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { TravelService } from 'src/app/services/travel.service';

@Component({
  selector: 'app-pedido-detalhe',
  templateUrl: './pedido-detalhe.component.html',
  styleUrls: ['./pedido-detalhe.component.css']
})
export class PedidoDetalheComponent implements OnInit, OnDestroy {
  pedido?: Pedido;
  private pedidoId!: string;
  private viagemCriada = false;
  motoristaConfirmado = false;

  constructor(
    private route: ActivatedRoute,
    private pedidoService: PedidoService,
    private viagemService: TravelService,
    private snackBar: MatSnackBar,
    private turnoService: TurnoService,
    private router: Router
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
        this.pedido = p;
        this.verificarCriacaoViagem();
      },
      error: err => this.snackBar.open('Erro ao atualizar pedido', 'Fechar', { duration: 3000 })
    });
  }

  private verificarCriacaoViagem(): void {
  if (
    this.pedido &&
    this.pedido.status === 'aceite' &&
    !this.viagemCriada &&
    this.pedido.motoristaSelecionado &&
    this.pedido.cliente
  ) {
    this.turnoService.getTurnoAtivo(this.pedido.motoristaSelecionado._id).subscribe({
      next: (turno) => {
        if (!turno) {
          this.snackBar.open('Nenhum turno ativo encontrado para este motorista.', 'Fechar', { duration: 3000 });
          return;
        }
        const viagemData = {
        cliente: this.pedido!.cliente._id,
        turno: {
          _id: turno._id,
          inicio: turno.inicio,
          fim: turno.fim,
          tipoCarro: turno.tipoCarro 
        },
        moradaInicio: this.pedido!.localizacaoAtual,
        moradaFim: this.pedido!.destino,
        numeroPessoas: this.pedido!.numeroPessoas,
        motoristaCoords: this.pedido!['motoristaCoords'] || { lat: 38.756734, lon: -9.155412 }
      };

      console.log('Dados enviados para criar viagem:', viagemData);

      this.viagemService.criarViagem(viagemData).subscribe({
        next: (viagem: any) => {
          console.log('Viagem criada:', viagem);
          this.viagemCriada = true;
          this.snackBar.open('Viagem iniciada!', 'Fechar', { duration: 3000 });
          this.router.navigate(['/travel-registe', viagem._id]);
        },
          error: err => this.snackBar.open('Erro ao iniciar viagem', 'Fechar', { duration: 3000 })
        });
      },
      error: err => this.snackBar.open('Erro ao obter turno do motorista', 'Fechar', { duration: 3000 })
    });
  }
}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPedido() {
    this.pedidoService.getPedido(this.pedidoId).subscribe({
      next: p => {this.pedido = p;console.log(this.pedido)},
      error: err => this.snackBar.open('Erro ao carregar pedido', 'Fechar', { duration: 3000 })
    });
  }

  onConfirmarMotorista() {
    if (!this.pedido) return;
    this.pedidoService.aceitarMotorista(this.pedido._id!).subscribe({
      next: () => {
        this.snackBar.open('Motorista confirmado!', 'Fechar', { duration: 3000 });
        this.motoristaConfirmado = true;
        this.verificarCriacaoViagem();
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
