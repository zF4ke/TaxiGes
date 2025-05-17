// src/app/services/pedido.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Pedido } from '../models/pedido.model';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private apiUrl = 'http://localhost:3000/api/pedidos';

  constructor(private http: HttpClient) {}

  /**
   * Cria um novo pedido de táxi (US6).
   */
  createPedido(pedido: Pedido): Observable<Pedido> {
    return this.http.post<Pedido>(this.apiUrl, pedido);
  }
  
  /**
   * Retorna um Observable que emite imediatamente e depois a cada 5s,
   * fazendo GET /api/pedidos?status=pendente para polling.
   */
  watchPedidosPendentes(): Observable<Pedido[]> {
    return timer(0, 5000).pipe(
      switchMap(() =>
        this.http.get<Pedido[]>(`${this.apiUrl}?status=pendente`)
      )
    );
  }

  watchPedidosPendentesComFiltro(motoristaId: string): Observable<Pedido[]> {
    return timer(0, 5000).pipe(
      switchMap(() =>
        this.http.get<Pedido[]>(`${this.apiUrl}?status=pendente&motoristaId=${motoristaId}`)
      )
    );
  }

  getPedidosPendentesComFiltro(motoristaId: string): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}?status=pendente&motoristaId=${motoristaId}`);
  }

  getPedidosFiltradosPorTurno(motoristaId: string): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}/filtrados-por-turno?motoristaId=${motoristaId}`);
  }

  rejeitarMotorista(pedidoId: string, motoristaId: string): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.apiUrl}/${pedidoId}/rejeitar-motorista`, { motoristaId });
  }

  /**
   * Cancela um pedido de táxi (US6.e).
   */
  cancelPedido(id: string): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.apiUrl}/${id}/cancelar`, {});
  }

  /**
   * Retorna um pedido específico.
   */
  getPedido(id: string): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/${id}`);
  }

  getUltimoPedidoAceiteDoMotorista(motoristaId: string) {
    return this.http.get<Pedido>(`${this.apiUrl}/ultimo-aceite/${motoristaId}`);
  }

  aceitarMotorista(pedidoId: string): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.apiUrl}/${pedidoId}/aceitar-motorista`, {});
  }

  deletePedido(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  selecionarPedido(pedidoId: string, motoristaId: string, motoristaCoords: any): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.apiUrl}/${pedidoId}/selecionar-motorista`, {
      motoristaId,
      motoristaCoords
    });
  }
}
