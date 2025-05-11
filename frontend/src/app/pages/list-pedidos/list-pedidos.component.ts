import { Component, OnInit, OnDestroy } from '@angular/core';
import { Pedido } from '../../models/pedido.model';
import { PedidoService } from '../../services/pedido.service';
import { MotoristaService } from '../../services/motorista.service';
import { GeocodingService } from '../../services/geocoding.service';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { haversineKm, Coordenadas } from 'src/app/utils/haversine.util';

@Component({
  selector: 'app-list-pedidos',
  templateUrl: './list-pedidos.component.html',
  styleUrls: ['./list-pedidos.component.css']
})
export class ListPedidosComponent implements OnInit, OnDestroy {
  pedidos: Pedido[] = [];
  private sub!: Subscription;
  motoristaCoords!: Coordenadas;

  constructor(
    private pedidoService: PedidoService,
    private motoristaService: MotoristaService,
    private geocodingService: GeocodingService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    const motorista = this.motoristaService.getMotoristaLogado();
    if (!motorista) {
      this.router.navigate(['/motorista-login']);
      return;
    }

    console.log('Motorista logado:', motorista);
    console.log('geolocation:', navigator.geolocation);
    console.log('currentPosition:', navigator.geolocation?.getCurrentPosition((pos) => {
      console.log('Posição atual:', pos.coords.latitude, pos.coords.longitude);
    }));
    console.log('A carregar pedidos...');
    this.motoristaCoords = { latitude: 38.756734, longitude: -9.155412 }; // fallback
    this.carregarPedidosFiltradosPorTurno(motorista._id);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.motoristaCoords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        };
        this.carregarPedidosFiltradosPorTurno(motorista._id);
      },
      (err) => {
        console.warn('Erro ao obter localização:', err);
        this.motoristaCoords = { latitude: 38.756734, longitude: -9.155412 }; // fallback
        this.carregarPedidosFiltradosPorTurno(motorista._id);
      }
    );
  }

  carregarPedidosFiltradosPorTurno(motoristaId: string): void {
    this.pedidoService.getPedidosFiltradosPorTurno(motoristaId).subscribe({
      next: (data) => {
        console.log('Pedidos recebidos:', data);
          // Show pedidos immediately
          this.pedidos = data;
          
          // Calculate distances in parallel
          Promise.all(data.map(async pedido => {
            if (!pedido['distanciaKm']) { // Only calculate if not already calculated
              const coords = await this.geocodingService.geocode(pedido.localizacaoAtual).toPromise();
              if (coords) {
                pedido['distanciaKm'] = haversineKm(this.motoristaCoords, coords);
              } else {
                pedido['distanciaKm'] = 999999;
              }
            }
            return pedido;
          })).then(pedidosComDistancia => {
            // Update the list with calculated distances and sort
            this.pedidos = pedidosComDistancia.sort((a, b) => (a['distanciaKm'] || 0) - (b['distanciaKm'] || 0));
          });
      },
      error: (err) => {
        console.error('Erro ao carregar pedidos filtrados:', err);
        this.snackBar.open('Erro ao carregar pedidos.', 'Fechar', { duration: 3000 });
      }
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

    this.pedidoService.selecionarPedido(id, motorista._id, this.motoristaCoords).subscribe({
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
        this.pedidos = this.pedidos.filter(p => p._id !== id);
      },
      error: () => this.snackBar.open('Erro ao eliminar pedido.', 'Fechar', { duration: 2000 })
    });
  }

  viewDetails(id: string): void {
    this.router.navigate(['/pedido', id]);
  }
}