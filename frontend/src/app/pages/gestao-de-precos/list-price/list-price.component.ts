import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PrecoService } from '../../../services/preco.service';
import { Preco } from '../../../models/preco.model';

@Component({
  selector: 'app-list-price',
  templateUrl: './list-price.component.html',
  styleUrls: ['./list-price.component.css']
})
export class ListPriceComponent implements OnInit {
  price: Preco | null = null;
  isLoading = true;
  editMode = false;
  editForm: FormGroup;

  constructor(private precoService: PrecoService, private fb: FormBuilder) {
    this.editForm = this.fb.group({
      precoBasico: [null, [Validators.required, Validators.min(0)]],
      precoLuxo: [null, [Validators.required, Validators.min(0)]],
      agravamento: [null, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.loadPrice();
  }

  loadPrice() {
    this.isLoading = true;
    this.precoService.getPrecos().subscribe({
      next: (prices) => {
        this.price = prices.length > 0 ? prices[0] : null;
        this.isLoading = false;
        if (this.price) {
          this.editForm.patchValue(this.price);
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onUpdate() {
    if (this.editForm.valid) {
      this.precoService.saveOrUpdatePreco(this.editForm.value).subscribe({
        next: (updated) => {
          this.price = updated;
          this.editMode = false; 
        },
        error: (err) => {
          console.error('Erro ao atualizar preço:', err);
        }
      });
    }
  }
  

  cancelEdit() {
    this.editMode = false;
    if (this.price) {
      this.editForm.patchValue(this.price);
    }
  }
}