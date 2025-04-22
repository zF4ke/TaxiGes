import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PrecoService } from '../../services/preco.service';

@Component({
  selector: 'app-update-price',
  templateUrl: './update-price.component.html',
  styleUrls: ['./update-price.component.css']
})
export class UpdatePriceComponent implements OnInit {
  priceForm: FormGroup;
  tipoConforto: string[] = ['básico', 'luxuoso'];
  errorMessage: string | null = null;
  priceId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private precoService: PrecoService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.priceForm = this.fb.group({
      precoPorMinuto: [null, [Validators.required, Validators.min(0.01)]],
      tipo: [{ value: '', disabled: true }],
      agravamento: [null, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.priceId = this.route.snapshot.paramMap.get('id');
    if (this.priceId) {
      this.loadPrice(this.priceId);
    }
  }

  loadPrice(id: string): void {
    this.precoService.getPrecoById(id).subscribe({
        next: (price) => {
        console.log('Dados carregados:', price);
        this.priceForm.patchValue({
            precoPorMinuto: price.precoPorMinuto,
            tipo: price.tipo,
            agravamento: price.agravamento
        });
        },
        error: (err) => {
        console.error('Erro ao carregar preço:', err);
        this.errorMessage = 'Erro ao carregar os dados do preço.';
        }
    });
  }


  onSubmit(): void {
    this.errorMessage = null;
  
    if (this.priceForm.valid && this.priceId) {
      this.priceForm.get('tipo')?.enable();
  
      this.precoService.updatePrice(this.priceId, this.priceForm.value).subscribe({
        next: () => {
          console.log('Preço atualizado com sucesso!');
          this.router.navigate(['/list-prices']); 
        },
        error: (err) => {
          console.error('Erro ao atualizar preço:', err);
          this.errorMessage = 'Erro ao atualizar o preço. Tente novamente mais tarde.';
        },
        complete: () => {
          this.priceForm.get('tipo')?.disable();
        }
      });
    }
  }
}