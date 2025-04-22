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
  canAddPrice = true; 
  tipoError: string | null = null;

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
        const tiposExistentes = prices.map((preco: any) => preco.tipo);

        this.tipoConforto = this.tipoConforto.filter(tipo => !tiposExistentes.includes(tipo));
        this.canAddPrice = this.tipoConforto.length > 0;; 
      },
      error: (err) => {
        console.error('Erro ao verificar preços existentes:', err);
      }
    });
  }

  onSubmit(): void {

    if (this.priceForm.valid) {
      this.precoService.addPrice(this.priceForm.value).subscribe({
        next: () => {
          console.log('Preço adicionado com sucesso!');
          this.router.navigate(['/list-prices']);
        },
        error: (err) => {
            if (err.status === 400) {
                this.tipoError = err.error.error || 'Erro ao adicionar preço.';
              } else {
                console.error('Erro ao adicionar preço:', err);
              }
        }
      });
    }
  }
}