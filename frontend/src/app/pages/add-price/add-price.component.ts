import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PrecoService } from '../../services/preco.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-price',
  templateUrl: './add-price.component.html',
  styleUrls: ['./add-price.component.css']
})
export class AddPriceComponent implements OnInit {
  priceForm: FormGroup;
  tipoConforto: string[] = ['básico', 'luxuoso'];
  errorMessage: string | null = null;
  canAddPrice = true; // Controla se o botão deve ser exibido

  constructor(
    private fb: FormBuilder,
    private precoService: PrecoService,
    private router: Router
  ) {
    this.priceForm = this.fb.group({
      precoPorMinuto: [null, [Validators.required, Validators.min(0.01)]],
      tipo: ['', [Validators.required]],
      agravamento: [null, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.checkExistingPrices();
  }

  checkExistingPrices(): void {
    this.precoService.getPrecos().subscribe({
      next: (prices) => {
        // Verifica se já existem preços para os dois tipos
        const tiposExistentes = prices.map((preco: any) => preco.tipo);
        if (tiposExistentes.includes('básico') && tiposExistentes.includes('luxuoso')) {
          this.canAddPrice = false; // Desabilita o botão
        }
      },
      error: (err) => {
        console.error('Erro ao verificar preços existentes:', err);
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = null;

    if (this.priceForm.valid) {
      this.precoService.addPrice(this.priceForm.value).subscribe({
        next: () => {
          console.log('Preço adicionado com sucesso!');
          this.router.navigate(['/list-price']);
        },
        error: (err) => {
          console.error('Erro ao adicionar preço:', err);

          if (err.error && err.error.error === 'Já existe um preço para este tipo de conforto.') {
            this.errorMessage = 'Já existe um preço para este tipo de conforto.';
          } else {
            this.errorMessage = 'Erro ao adicionar preço. Tente novamente mais tarde.';
          }
        }
      });
    }
  }
}