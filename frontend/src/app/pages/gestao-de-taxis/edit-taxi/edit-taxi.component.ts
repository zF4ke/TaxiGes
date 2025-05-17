import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaxiService } from 'src/app/services/taxi.service';
import { Taxi } from 'src/app/models/taxi.model';

@Component({
  selector: 'app-edit-taxi',
  templateUrl: './edit-taxi.component.html',
  styleUrls: ['./edit-taxi.component.css']
})
export class EditTaxiComponent implements OnInit {
  taxiForm: FormGroup;
  taxiId: string;
  podeEditarConforto = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private taxiService: TaxiService
  ) {
    this.taxiForm = this.fb.group({
      matricula: ['', Validators.required],
      anoCompra: ['', Validators.required],
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      conforto: ['', Validators.required]
    });
    this.taxiId = '';
  }

  ngOnInit(): void {
    this.taxiId = this.route.snapshot.paramMap.get('id') || '';
    this.isLoading = true;
    this.taxiService.getTaxiById(this.taxiId).subscribe({
      next: (taxi: Taxi) => {
        this.taxiForm.patchValue(taxi);
        // Verifica se pode editar conforto (podes adaptar conforme o backend)
        this.taxiService.podeEditarConforto(this.taxiId).subscribe({
          next: (res: { podeEditar: boolean }) => {
            this.podeEditarConforto = res.podeEditar;
            if (!this.podeEditarConforto) {
              this.taxiForm.get('conforto')?.disable();
            }
            this.isLoading = false;
          },
          error: () => {
            this.podeEditarConforto = true;
            this.isLoading = false;
          }
        });
      },
      error: () => {
        alert('Erro ao carregar táxi.');
        this.router.navigate(['/list-taxis']);
      }
    });
  }

  onSubmit(): void {
    if (this.taxiForm.invalid) return;
    const dados = this.taxiForm.getRawValue();
    this.taxiService.updateTaxi(this.taxiId, dados).subscribe({
      next: () => {
        alert('Táxi atualizado com sucesso!');
        this.router.navigate(['/list-taxis']);
      },
      error: err => {
        alert(err.error?.message || 'Erro ao atualizar táxi.');
      }
    });
  }
}