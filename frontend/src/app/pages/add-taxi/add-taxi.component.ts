import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TaxiService } from '../../services/taxi.service';
import { TAXI_BRANDS, TAXI_MODELS, TaxiConforto } from '../../models/taxi.model';

@Component({
  selector: 'app-add-taxi',
  templateUrl: './add-taxi.component.html',
  styleUrls: ['./add-taxi.component.css']
})
export class AddTaxiComponent implements OnInit {
  taxiForm!: FormGroup;
  marcas = TAXI_BRANDS;
  modelos: string[] = [];
  confortoOpcoes: TaxiConforto[] = ['básico', 'luxuoso'];
  currentYear = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private taxiService: TaxiService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.createForm();
  }

  ngOnInit() {
    // Watch for marca changes to update modelo options
    this.taxiForm.get('marca')?.valueChanges.subscribe(marca => {
      this.modelos = TAXI_MODELS[marca] || [];
      this.taxiForm.get('modelo')?.setValue('');
    });
  }

  private createForm() {
    this.taxiForm = this.fb.group({
      matricula: ['', [
        Validators.required,
        Validators.pattern('^[A-Z0-9]{2}-[A-Z0-9]{2}-[A-Z0-9]{2}$')
      ]],
      anoCompra: ['', [
        Validators.required,
        Validators.min(1900),
        Validators.max(this.currentYear)
      ]],
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      conforto: ['básico', Validators.required]
    });
  }

  onSubmit() {
    if (this.taxiForm.valid) {
      this.taxiService.addTaxi(this.taxiForm.value).subscribe({
        next: () => {
          this.snackBar.open('Táxi adicionado com sucesso!', 'Fechar', {
            duration: 3000
          });
          this.router.navigate(['/list-taxis']);
        },
        error: (error) => {
          this.snackBar.open('Erro ao adicionar táxi: ' + error.message, 'Fechar', {
            duration: 3000
          });
        }
      });
    }
  }
}
