import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PrecoService } from '../../services/preco.service';

@Component({
  selector: 'app-simulate-travel',
  templateUrl: './simulate-travel.component.html',
  styleUrls: ['./simulate-travel.component.css']
})
export class SimulateTravelComponent implements OnInit {
  travelForm: FormGroup;
  tipoConforto: string[] = [];
  resultado: { preco: number; tipo: string; horaInicial: string; horaFinal: string } | null = null;
  hasPrices: boolean = false;

  constructor(private fb: FormBuilder, private precoService: PrecoService) {
    this.travelForm = this.fb.group({
      tipo: ['', [Validators.required]],
      horaInicial: ['', [Validators.required]],
      horaFinal: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.precoService.getPrecos().subscribe({
      next: (precos) => {
        this.hasPrices = precos.length > 0;
        if (this.hasPrices) {
          this.tipoConforto = precos.map((preco) => preco.tipo);
        }
      },
      error: (err) => {
        console.error('Erro ao carregar preços:', err);
        this.hasPrices = false;
      }
    });
  }

  onSubmit(): void {
    if (this.travelForm.valid) {
      const { tipo, horaInicial, horaFinal } = this.travelForm.value;
      
      this.precoService.simulateTravel({ tipo, horaInicial, horaFinal }).subscribe({
        next: (result) => {
          this.resultado = result;
        },
        error: (err) => {
          console.error('Erro ao simular viagem:', err);
        }
      });
    }
  }
}