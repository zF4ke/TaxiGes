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
  tipoConforto: string[] = ['básico', 'luxuoso'];
  resultado: { preco: number; tipo: string; horaInicial: string; horaFinal: string } | null = null;
  hasPrices: boolean = false;
  precos: any = null;

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
          this.precos = precos[0]; // Só existe um documento
        }
      },
      error: (err) => {
        console.error('Erro ao carregar preços:', err);
        this.hasPrices = false;
      }
    });
  }

  onSubmit(): void {
    if (this.travelForm.valid && this.precos) {
      const { tipo, horaInicial, horaFinal } = this.travelForm.value;

      // Calcular a diferença de minutos
      const [hIni, mIni] = horaInicial.split(':').map(Number);
      const [hFim, mFim] = horaFinal.split(':').map(Number);
      let minutos = (hFim * 60 + mFim) - (hIni * 60 + mIni);
      if (minutos < 0) minutos += 24 * 60; // caso passe da meia-noite

      // Seleciona o preço correto
      const precoPorMinuto = tipo === 'básico' ? this.precos.precoBasico : this.precos.precoLuxo;

      // Aplica agravamento se necessário (exemplo: entre 22h e 6h)
      let agravamento = 1;
      if (hIni >= 22 || hIni < 6) {
        agravamento += (this.precos.agravamento / 100);
      }

      const preco = minutos * precoPorMinuto * agravamento;

      this.resultado = {
        preco,
        tipo,
        horaInicial,
        horaFinal
      };
    }
  }
}