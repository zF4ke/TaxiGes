import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Viagem } from '../models/viagem.model';
import { environment } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class TravelService {
  private apiUrl = `${environment.apiUrl}/viagens`;

  constructor(private http: HttpClient) {}

  criarViagem(dados: any): Observable<Viagem> {
    return this.http.post<any>(`${this.apiUrl}`, dados);
  }

  getViagem(id: string): Observable<Viagem> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getViagensPorMotorista(motoristaId: string): Observable<Viagem[]> {
    return this.http.get<Viagem[]>(`${this.apiUrl}/motorista/${motoristaId}`);
  }

  getViagensPorTaxi(taxiId: string): Observable<Viagem[]> {
    return this.http.get<Viagem[]>(`${this.apiUrl}/taxi/${taxiId}`);
  }

  updateFimViagem(id: string, fim: string, localFim: string): Observable<Viagem> {
    return this.http.patch<Viagem>(`${this.apiUrl}/${id}/fim`, { fim, localFim });
  }

  // Relatório de viagens por táxi
  getRelatorioViagens(params?: { inicio?: string, fim?: string }): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/relatorio`, { params });
  }
}