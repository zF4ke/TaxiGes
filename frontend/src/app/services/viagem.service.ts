import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ViagemService {
  private apiUrl = 'http://localhost:3000/api/viagens';

  constructor(private http: HttpClient) {}

  criarViagem(dados: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, dados);
  }

  getViagemById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getAllViagens(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  registarEntradaPassageiros(id: string, dados: any) {
    return this.http.patch(`${this.apiUrl}/${id}/entrada`, dados);
  }

  atualizarViagem(id: string, dados: any) {
    return this.http.patch(`/api/viagens/${id}`, dados);
  }
}