import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Preco } from '../models/preco.model';

@Injectable({
  providedIn: 'root'
})
export class PrecoService {
  private apiUrl = 'http://localhost:3000/api/precos';

  constructor(private http: HttpClient) { }

  getPrecos(): Observable<Preco[]> {
    return this.http.get<Preco[]>(this.apiUrl);
  }
  
  addPrice(preco: Preco): Observable<Preco> {
    return this.http.post<Preco>(this.apiUrl, preco);
  }

  updatePrice(id: string, preco: Preco): Observable<Preco> {
    return this.http.put<Preco>(`${this.apiUrl}/${id}`, preco);
  }

  getPrecoById(id: string): Observable<Preco> {
    return this.http.get<Preco>(`${this.apiUrl}/${id}`);
  }
}