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
}
