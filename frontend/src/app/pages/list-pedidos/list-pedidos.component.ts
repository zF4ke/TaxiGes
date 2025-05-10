import { Component, OnInit, OnDestroy } from '@angular/core';
import { Pedido } from '../../models/pedido.model';
import { PedidoService } from '../../services/pedido.service';
import { MotoristaService } from '../../services/motorista.service';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-pedidos',
  templateUrl: './list-pedidos.component.html',
  styleUrls: ['./list-pedidos.component.css']
})
export class ListPedidosComponent implements OnInit, OnDestroy {
  pedidos: Pedido[] = [];
  private sub!: Subscription;

  constructor(
    private pedidoService: PedidoService,
    private motoristaService: MotoristaService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    const motorista = this.motoristaService.getMotoristaLogado();
    if (!motorista) {
      this.router.navigate(['/motorista-login']);
      return;
    }

    this.sub = this.pedidoService.watchPedidosPendentesComFiltro(motorista._id)
      .subscribe({
        next: data => this.pedidos = data,
        error: () => this.snackBar.open('Erro ao carregar pedidos.', 'Fechar', { duration: 3000 })
      });
  }


  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  accept(id: string): void {
    const motorista = this.motoristaService.getMotoristaLogado();
    if (!motorista) {
      this.snackBar.open('Motorista não autenticado.', 'Fechar', { duration: 2000 });
      return;
    }

    this.pedidoService.acceptPedido(id, motorista._id).subscribe({
      next: pedido => {
        this.snackBar.open('Pedido aceite.', 'Fechar', { duration: 2000 });
        this.router.navigate(['/motorista/pedido', pedido._id]);
      },
      error: () => this.snackBar.open('Erro ao aceitar pedido.', 'Fechar', { duration: 2000 })
    });
  }


  deletePedido(id: string): void {
    this.pedidoService.deletePedido(id).subscribe({
      next: () => {
        this.snackBar.open('Pedido eliminado.', 'Fechar', { duration: 2000 });
        // Atualiza a lista localmente sem recarregar tudo
        this.pedidos = this.pedidos.filter(p => p._id !== id);
      },
      error: () => this.snackBar.open('Erro ao eliminar pedido.', 'Fechar', { duration: 2000 })
    });
  }

  viewDetails(id: string): void {
    this.router.navigate(['/pedido', id]);
  }
}