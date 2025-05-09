
import { Component, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import * as L from 'leaflet';
import { GeocodingService } from '../../services/geocoding.service';

@Component({
  selector: 'app-mapa-selecionar-destino',
  templateUrl: './mapa-selecionar-destino.component.html',
  styleUrls: ['./mapa-selecionar-destino.component.css']
})
export class MapaSelecionarDestinoComponent {
  @Output() destinoSelecionado = new EventEmitter<{ rua: string; localidade: string; codigoPostal: string }>();
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef<HTMLDivElement>;

  mapVisible = false;
  private map!: L.Map;
  private marker!: L.Marker;

  constructor(private geocodingService: GeocodingService) {}

  abrirMapa(): void {
    this.mapVisible = true;

    // Esperar o DOM renderizar o container
    setTimeout(() => {
      if (!this.map) {
        this.map = L.map(this.mapContainer.nativeElement).setView([38.7169, -9.1399], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.map);

        this.map.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          if (this.marker) {
            this.marker.setLatLng(e.latlng);
          } else {
            this.marker = L.marker(e.latlng).addTo(this.map);
          }

          this.geocodingService.reverseGeocode(lat, lng).subscribe({
            next: data => {
              this.destinoSelecionado.emit(data);
              this.fecharMapa();
            },
            error: err => console.warn('Erro ao obter morada:', err)
          });
        });
      }

      // Corrigir tiles desalinhados
      this.map.invalidateSize();
      setTimeout(() => this.map.invalidateSize(), 200);
      window.dispatchEvent(new Event('resize'));

    }, 100);
  }

  fecharMapa(): void {
    this.mapVisible = false;
  }
}
