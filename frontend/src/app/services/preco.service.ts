import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Preco } from '../models/preco.model';
import { environment } from '../config/api.config';

export interface SimulationRequest {
  tipo: string;
  horaInicial: string;
  horaFinal: string;
}

export interface SimulationResult {
  preco: number;
  tipo: string;
  horaInicial: string;
  horaFinal: string;
}

@Injectable({
  providedIn: 'root'
})
export class PrecoService {
  private apiUrl = `${environment.apiUrl}/precos`;

  constructor(private http: HttpClient) { }

  getPrecos(): Observable<Preco[]> {
    return this.http.get<Preco[]>(this.apiUrl);
  }
  
  saveOrUpdatePreco(preco: Preco): Observable<Preco> {
    return this.http.post<Preco>(this.apiUrl, preco);
  }

  getPrecoById(id: string): Observable<Preco> {
    return this.http.get<Preco>(`${this.apiUrl}/${id}`);
  }

  deletePrecoById(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  simulateTravel(params: SimulationRequest): Observable<SimulationResult> {
    return this.http.post<SimulationResult>(`${this.apiUrl}/simulate`, params);
  }
}