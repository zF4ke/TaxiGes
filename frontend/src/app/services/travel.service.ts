import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Viagem } from '../models/viagem.model';

@Injectable({ providedIn: 'root' })
export class TravelService {
  private apiUrl = 'http://localhost:3000/api/viagens';

  constructor(private http: HttpClient) {}

  criarViagem(dados: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, dados);
  }

  getViagem(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getViagensPorMotorista(motoristaId: string): Observable<Viagem[]> {
    return this.http.get<Viagem[]>(`${this.apiUrl}/motorista/${motoristaId}`);
  }
}