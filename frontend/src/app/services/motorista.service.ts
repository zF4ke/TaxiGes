import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Motorista } from '../models/motorista.model';
import { Observable, of, delay } from 'rxjs';
@Injectable({
    providedIn: 'root' 
})
export class MotoristaService {
    private apiUrl = 'http://localhost:3000/api/motoristas';

    constructor(private http: HttpClient) { }

    getAllMotoristas(): Observable<Motorista[]> {

      console.log('[MotoristaService] Buscando todos os motoristas da API...');
      return this.http.get<Motorista[]>(this.apiUrl);
    }


    addMotorista(motorista: Motorista): Observable<Motorista> {
      console.log('[MotoristaService] Enviando motorista para API:', motorista);
      return this.http.post<Motorista>(this.apiUrl, motorista); 
    }

    getLocalityFromPostalCode(cp: string): Observable<{ localidade: string } | null> {
      if (!/^\d{4}-\d{3}$/.test(cp)) {
        return new Observable(observer => {
            observer.next(null);
            observer.complete();
        });
      }
      return this.http.get<{ localidade: string } | null>(`${this.apiUrl}/localidade/${cp}`);
  }
}

