import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TurnoService {
  private apiUrl = 'http://localhost:3000/api/turnos';

  constructor(private http: HttpClient) { }

  addTurno(turno: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, turno);
  }

  getAllAvailableTaxis(inicio: string, fim: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/taxis-disponiveis?inicio=${inicio}&fim=${fim}`);
  }

  getTurnosByMotorista(motoristaId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/motorista/${motoristaId}`);
  }

  checkMotoristaTurno(motoristaId: string, inicio: string, fim: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/check-motorista-turno`, { motoristaId, inicio, fim });
  }
  
  getTurnoAtivo(motoristaId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ativo/${motoristaId}`);
  }

  getTurno(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

}
