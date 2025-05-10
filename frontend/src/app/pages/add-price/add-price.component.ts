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
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private precoService: PrecoService,
    private router: Router
  ) {
    this.priceForm = this.fb.group({
      precoBasico: [null, [Validators.required, Validators.min(0)]],
      precoLuxo: [null, [Validators.required, Validators.min(0)]],
      agravamento: [null, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    // Se quiser carregar valores existentes para edição:
    this.precoService.getPrecos().subscribe({
      next: (precos) => {
        if (precos.length > 0) {
          this.priceForm.patchValue(precos[0]);
        }
      },
      error: (err) => {
        console.error('Erro ao carregar preços existentes:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.priceForm.valid) {
      this.precoService.saveOrUpdatePreco(this.priceForm.value).subscribe({
        next: () => {
          this.router.navigate(['/list-price']);
        },
        error: (err) => {
          this.errorMessage = 'Erro ao salvar preço.';
          console.error('Erro ao salvar preço:', err);
        }
      });
    }
  }
}