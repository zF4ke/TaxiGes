import { Component, OnInit } from '@angular/core';
import { PedidoService } from '../../services/pedido.service';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-list-pedido-completo',
  templateUrl: './list-pedido-completo.component.html',
  styleUrls: ['./list-pedido-completo.component.css']
})
export class ListPedidoCompletoComponent implements OnInit {
  pedidos: any[] = [];
  erro: string | null = null;

  constructor(
    private pedidoService: PedidoService,
    private router: Router 
  ) {}

  ngOnInit(): void {
    this.pedidoService.getAllPedidos().subscribe({
      next: (data) => this.pedidos = data,
      error: (err) => this.erro = 'Erro ao carregar pedidos.'
    });
  }

  viewDetails(id: string): void {
    this.router.navigate(['/pedido', id]);
  }

  eliminarPedido(id: string) {
    if (confirm('Tem a certeza que deseja eliminar este pedido?')) {
        this.pedidoService.deletePedido(id).subscribe({
        next: () => {
            this.pedidos = this.pedidos.filter(p => p._id !== id);
        },
        error: () => alert('Erro ao eliminar pedido.')
        });
    }
    }
}