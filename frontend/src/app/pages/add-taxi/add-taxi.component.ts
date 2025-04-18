import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
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
        plateValidator()
      ]],
      anoCompra: ['', [
        Validators.required,
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

function plateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const plateRegex = /^[A-Z0-9]{2}-[A-Z0-9]{2}-[A-Z0-9]{2}$/;
    if (!plateRegex.test(control.value)) {
      return { invalidPlate: 'Formato invalido. Use o formato XX-XX-XX.' };
    }

    const [part1, part2, part3] = control.value.split('-');
    const isAllNumbers = (str: string) => /^[0-9]{2}$/.test(str);
    const isAllLetters = (str: string) => /^[A-Z]{2}$/.test(str);

    if (
      (isAllNumbers(part1) && isAllNumbers(part2) && isAllNumbers(part3)) ||
      (isAllLetters(part1) && isAllLetters(part2) && isAllLetters(part3))
    ) {
      return { invalidPlate: 'Os pares nao podem ser todos numeros ou todas letras.' };
    }

    return null;
  };
}
