import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Morada } from '../models/morada.model';
import { Coordenadas } from '../utils/haversine.util';

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private nominatimUrl = 'https://nominatim.openstreetmap.org/reverse';

  constructor(private http: HttpClient) {}

  reverseGeocode(lat: number, lon: number): Observable<{ rua: string; localidade: string; codigoPostal: string }> {
    const params = {
      format: 'json',
      lat: lat.toString(),
      lon: lon.toString(),
      addressdetails: '1'
    };

    return this.http.get<any>(this.nominatimUrl, { params }).pipe(
      map((res) => {
        const addr = res.address || {};
        return {
          rua: addr.road || addr.pedestrian || addr.path || '',
          localidade: addr.city || addr.town || addr.village || '',
          codigoPostal: addr.postcode || ''
        };
      })
    );
  }

  geocode(morada: Morada): Observable<Coordenadas> {
    const address = `${morada.rua ?? ''}, ${morada.numeroPorta ?? ''}, ${morada.codigoPostal}, ${morada.localidade}`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

    return this.http.get<any[]>(url).pipe(
      map(results => {
        if (results.length === 0) return {} as Coordenadas;
        return {
          latitude: parseFloat(results[0].lat),
          longitude: parseFloat(results[0].lon)
        } as Coordenadas;
      })
    );
  }
}
