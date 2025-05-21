import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaxiService } from 'src/app/services/taxi.service';
import { Taxi } from 'src/app/models/taxi.model';
import { NivelConforto, TAXI_BRANDS, TAXI_MODELS } from 'src/app/models/constants';

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
  marcas = TAXI_BRANDS;
  modelos: string[] = [];
  confortoOpcoes: NivelConforto[] = ['básico', 'luxuoso'];
  currentYear = new Date().getFullYear();

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

  ngOnInit() {
  this.taxiId = this.route.snapshot.paramMap.get('id') || '';
  this.taxiForm = this.fb.group({
    matricula: ['', [Validators.required, plateValidator()]],
    anoCompra: ['', [Validators.required, Validators.max(this.currentYear), Validators.min(0)]],
    marca: ['', Validators.required],
    modelo: ['', Validators.required],
    conforto: ['', Validators.required]
  });

  this.taxiService.getTaxiById(this.taxiId).subscribe({
      next: (taxi: Taxi) => {
        this.taxiForm.patchValue(taxi);
        this.modelos = TAXI_MODELS[taxi.marca as keyof typeof TAXI_MODELS] || [];
      },
      error: () => {
        alert('Erro ao carregar táxi.');
        this.router.navigate(['/list-taxis']);
      }
    });

  this.taxiForm.get('marca')?.valueChanges.subscribe((marca: keyof typeof TAXI_MODELS) => {
    this.modelos = TAXI_MODELS[marca] || [];
    this.taxiForm.get('modelo')?.setValue('');
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