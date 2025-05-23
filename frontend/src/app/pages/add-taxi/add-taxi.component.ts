import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TaxiService } from '../../services/taxi.service';
import { TAXI_BRANDS, TAXI_MODELS } from '../../models/taxi.model';
import { NivelConforto } from 'src/app/models/nivel-conforto.type';

@Component({
  selector: 'app-add-taxi',
  templateUrl: './add-taxi.component.html',
  styleUrls: ['./add-taxi.component.css']
})
export class AddTaxiComponent implements OnInit {
  taxiForm!: FormGroup;
  marcas = TAXI_BRANDS;
  modelos: string[] = [];
  confortoOpcoes: NivelConforto[] = ['básico', 'luxuoso'];
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
        Validators.max(this.currentYear),
        Validators.min(0)
      ]],
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      conforto: ['', Validators.required]
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
      return { patternError: true };
    }

    const [part1, part2, part3] = control.value.split('-');
    const isAllNumbers = (str: string) => /^[0-9]{2}$/.test(str);
    const isAllLetters = (str: string) => /^[A-Z]{2}$/.test(str);
    const hasMixedCharacters = (str: string) => !isAllNumbers(str) && !isAllLetters(str);

    // Check if any pair has mixed characters
    if (hasMixedCharacters(part1) || hasMixedCharacters(part2) || hasMixedCharacters(part3)) {
      return { patternError: true };
    }

    // Check if all pairs are numbers or all pairs are letters
    if (
      (isAllLetters(part1) && isAllNumbers(part2) && isAllLetters(part3)) || // XX-00-XX
      (isAllNumbers(part1) && isAllLetters(part2) && isAllNumbers(part3)) || // 00-XX-00
      (isAllNumbers(part1) && isAllNumbers(part2) && isAllLetters(part3)) || // 00-00-XX
      (isAllLetters(part1) && isAllNumbers(part2) && isAllNumbers(part3))    // XX-00-00
    ) {
      return null;
    }

    return { patternError: true };
  };
}
