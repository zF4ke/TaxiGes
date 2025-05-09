import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PedidoService } from '../../services/pedido.service';
import { Pedido } from '../../models/pedido.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-motorista-pedido-detalhe',
  templateUrl: './motorista-pedido-detalhe.component.html',
  styleUrls: ['./motorista-pedido-detalhe.component.css']
})
export class MotoristaPedidoDetalheComponent implements OnInit {
  pedido!: Pedido;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private pedidoService: PedidoService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.pedidoService.getPedido(id).subscribe({
        next: data => {
          this.pedido = data;
          this.isLoading = false;
        },
        error: err => {
          this.snackBar.open('Erro ao carregar pedido.', 'Fechar', { duration: 3000 });
          this.router.navigate(['/list-pedidos']);
        }
      });
    }
  }
}
