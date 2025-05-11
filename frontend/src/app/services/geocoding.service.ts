import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { Morada } from '../models/morada.model';
import { Coordenadas } from '../utils/haversine.util';

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private nominatimUrl = 'https://nominatim.openstreetmap.org/reverse';
  private cache = new Map<string, Coordenadas>();
  private pendingRequests = new Map<string, Observable<Coordenadas>>();

  constructor(private http: HttpClient) {}

  private getAddressKey(morada: Morada): string {
    return `${morada.rua ?? ''},${morada.numeroPorta ?? ''},${morada.codigoPostal},${morada.localidade}`;
  }

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
    const addressKey = this.getAddressKey(morada);
    
    // Check completed cache first
    if (this.cache.has(addressKey)) {
      return new Observable(observer => {
        observer.next(this.cache.get(addressKey)!);
        observer.complete();
      });
    }

    // Check if there's a pending request
    if (this.pendingRequests.has(addressKey)) {
      return this.pendingRequests.get(addressKey)!;
    }

    // If not in cache or pending, make the API call
    const address = `${morada.rua ?? ''}, ${morada.numeroPorta ?? ''}, ${morada.codigoPostal}, ${morada.localidade}`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

    // Create the request and share it between subscribers
    const request = this.http.get<any[]>(url).pipe(
      map(results => {
        if (results.length === 0) return {} as Coordenadas;
        return {
          latitude: parseFloat(results[0].lat),
          longitude: parseFloat(results[0].lon)
        } as Coordenadas;
      }),
      shareReplay(1)  // Cache the response for all subscribers
    );

    // Store the pending request
    this.pendingRequests.set(addressKey, request);

    // Subscribe to store in permanent cache and clean up pending
    request.subscribe(coords => {
      this.cache.set(addressKey, coords);
      this.pendingRequests.delete(addressKey);
    });

    return request;
  }
}
