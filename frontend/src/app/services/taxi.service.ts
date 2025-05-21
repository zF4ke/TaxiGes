import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Taxi } from '../models/taxi.model';

@Injectable({
  providedIn: 'root'
})
export class TaxiService {
  private apiUrl = 'http://localhost:3000/api/taxis';

  constructor(private http: HttpClient) { }

  getAllTaxis(): Observable<Taxi[]> {
    return this.http.get<Taxi[]>(this.apiUrl);
  }
  
  addTaxi(taxi: Taxi): Observable<Taxi> {
    return this.http.post<Taxi>(this.apiUrl, taxi);
  }

  deleteTaxi(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getTaxiById(id: string): Observable<Taxi> {
    return this.http.get<Taxi>(`${this.apiUrl}/${id}`);
  }

  updateTaxi(id: string, dados: Partial<Taxi>): Observable<Taxi> {
    return this.http.put<Taxi>(`${this.apiUrl}/${id}`, dados);
  }

  // Para verificar se pode editar conforto, se implementares no backend:
  podeEditarConforto(id: string): Observable<{ podeEditar: boolean }> {
    return this.http.get<{ podeEditar: boolean }>(`${this.apiUrl}/${id}/pode-editar-conforto`);
  }
  // Relatório de viagens por táxi
  getRelatorioTaxis(params?: { inicio?: string, fim?: string }): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/relatorio`, { params });
  }
}
