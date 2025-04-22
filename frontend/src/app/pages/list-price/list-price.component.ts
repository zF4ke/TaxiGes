import { Component, OnInit } from '@angular/core';
import { PrecoService } from '../../services/preco.service';
import {Preco} from '../../models/preco.model';

@Component({
  selector: 'app-list-price',
  templateUrl: './list-price.component.html',
  styleUrls: ['./list-price.component.css']
})
export class ListPriceComponent implements OnInit {
    prices: Preco[] = [];
    isLoading = true; 
    displayedColumns: string[] = ['precoPorMinuto', 'tipo', 'agravamento', 'acoes'];
  
    constructor(private precoService: PrecoService) {}
  
    ngOnInit() {
      this.loadPrices(); 
    }
  
    loadPrices() {
      this.precoService.getPrecos().subscribe({
        next: (prices) => {
          this.prices = prices;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erro ao carregar preços:', err);
          this.isLoading = false;
        }
      });
    }

}