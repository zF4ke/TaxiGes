import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, tap } from 'rxjs';
import { Motorista } from '../models/motorista.model';

export interface MotoristaSelecao {
  _id: string;
  nome: string;
  nif: string;
}

export interface MotoristaLogado {
  _id: string;
  nome: string;
  nif: string;
}

@Injectable({
    providedIn: 'root' 
})
export class MotoristaService {
    private apiUrl = 'http://localhost:3000/api/motoristas';

    private motoristaAtual: MotoristaLogado | null = null;

    public isLoggedIn: boolean = false;

    constructor(private http: HttpClient) {
      const storedMotorista = localStorage.getItem('motoristaLogado');
      if (storedMotorista) {
        this.motoristaAtual = JSON.parse(storedMotorista);
        this.isLoggedIn = true; 
      }
    }

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

    getMotoristasParaSelecao(): Observable<MotoristaSelecao[]> {
      return this.http.get<MotoristaSelecao[]>(`${this.apiUrl}/para-selecao`);
    }
  
    loginComNIF(nif: string): Observable<MotoristaLogado> {
      return this.http.post<MotoristaLogado>(`${this.apiUrl}/acesso-nif`, { nif })
        .pipe(
          tap(motorista => {
            if (motorista) {
              this.motoristaAtual = motorista; 
              this.isLoggedIn = true;         
              localStorage.setItem('motoristaLogado', JSON.stringify(motorista));
            }
          })
        );
    }
  
    setMotoristaLogado(motorista: MotoristaLogado): void {
      this.motoristaAtual = motorista; 
      this.isLoggedIn = true;         
      localStorage.setItem('motoristaLogado', JSON.stringify(motorista));
    }
  
    getMotoristaLogado(): MotoristaLogado | null {
      return this.motoristaAtual;
    }
  
    logoutMotorista(): void {
      this.motoristaAtual = null; 
      this.isLoggedIn = false;    
      localStorage.removeItem('motoristaLogado');
    }
}

