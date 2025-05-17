import { Component, OnInit } from '@angular/core';
import { TaxiService } from '../../../services/taxi.service';
import { Taxi } from '../../../models/taxi.model';

@Component({
  selector: 'app-list-taxis',
  templateUrl: './list-taxis.component.html',
  styleUrls: ['./list-taxis.component.css']
})
export class ListTaxisComponent implements OnInit {
  taxis: Taxi[] = [];
  displayedColumns: string[] = ['matricula', 'anoCompra', 'marca', 'modelo', 'conforto', 'createdAt', 'acoes'];
  isLoading = true;

  constructor(private taxiService: TaxiService) {}

  ngOnInit() {
    this.loadTaxis();
  }

  loadTaxis() {
    this.taxiService.getAllTaxis().subscribe({
      next: (taxis) => {
        this.taxis = taxis;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar táxis:', error);
        this.isLoading = false;
      }
    });
  }

  eliminarTaxi(id: string) {
    if (confirm('Tem a certeza que deseja eliminar este táxi?')) {
      this.taxiService.deleteTaxi(id).subscribe({
        next: () => this.loadTaxis(),
        error: err => alert(err.error?.message || 'Erro ao eliminar táxi')
      });
    }
  }
}
