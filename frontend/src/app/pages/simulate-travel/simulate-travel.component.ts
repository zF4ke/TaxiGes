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

  constructor(private fb: FormBuilder,  private precoService: PrecoService) {
    this.travelForm = this.fb.group({
      tipo: ['', [Validators.required]],
      horaInicial: ['', [Validators.required]],
      horaFinal: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.precoService.getPrecos().subscribe((precos) => {
        this.hasPrices = precos.length > 0;

        if(this.hasPrices) {
            this.tipoConforto = precos.map((preco) => preco.tipo);
        }
      });
  }

  onSubmit(): void {
    if (this.travelForm.valid) {
        const { tipo, horaInicial, horaFinal } = this.travelForm.value;
    
        const [horaInicio, minutoInicio] = horaInicial.split(':').map(Number);
        const [horaFim, minutoFim] = horaFinal.split(':').map(Number);
    
        const minutosInicio = horaInicio * 60 + minutoInicio;
        const minutosFim = horaFim * 60 + minutoFim;
    
        let duracao = minutosFim - minutosInicio;
        if (duracao < 0) {
            duracao += 24 * 60;
        }
    
        this.precoService.getPrecos().subscribe((precos) => {
            const preco = precos.find((p) => p.tipo === tipo);
    
            if (!preco) {
            console.error('Tipo de conforto não encontrado.');
            return;
            }
    
            const precoPorMinuto = preco.precoPorMinuto;
            const agravamento = preco.agravamento;
    
            let minutosNoturnos = 0;
            for (let i = 0; i < duracao; i++) {
            const horaAtual = Math.floor((minutosInicio + i) / 60) % 24;
            if (horaAtual >= 21 || horaAtual < 6) {
                minutosNoturnos++;
            }
            }
    
            const minutosNormais = duracao - minutosNoturnos;
            const precoEstimado =
            minutosNormais * precoPorMinuto +
            minutosNoturnos * precoPorMinuto * (1 + agravamento / 100);
    
            this.resultado = {
                preco: precoEstimado,
                tipo,
                horaInicial,
                horaFinal
              };
        });
    }
  }
  
}