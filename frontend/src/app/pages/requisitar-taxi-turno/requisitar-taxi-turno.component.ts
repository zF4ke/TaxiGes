import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { catchError, map, Observable, of } from 'rxjs';
import { TurnoService } from 'src/app/services/turno.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MotoristaService } from 'src/app/services/motorista.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-requisitar-taxi-turno',
  templateUrl: './requisitar-taxi-turno.component.html',
  styleUrls: ['./requisitar-taxi-turno.component.css']
})
export class RequisitarTaxiTurnoComponent implements OnInit {
  turnoForm!: FormGroup;
  taxisDisponiveis: any[] = [];
  displayedColumns: string[] = ['marca', 'modelo', 'conforto', 'acoes'];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private turnoService: TurnoService,
    private snackBar: MatSnackBar,
    private motoristaService: MotoristaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.turnoForm = this.fb.group({
      inicio: ['', [Validators.required, this.inicioValidator()], [this.motoristaTurnoValidator()]],
      fim: ['', [Validators.required, this.fimValidator()]],
    });

    // Revalidar 'fim' apenas se o valor de 'inicio' mudar e afetar a validade de 'fim'
    this.turnoForm.get('inicio')?.valueChanges.subscribe((newInicio) => {
      const currentFim = this.turnoForm.get('fim')?.value;
      if (currentFim) {
        const dataInicio = new Date(newInicio).getTime();
        const dataFim = new Date(currentFim).getTime();
        const fimControl = this.turnoForm.get('fim');

        if (dataFim <= dataInicio) {
          const existingErrors = fimControl?.errors || {};
          fimControl?.setErrors({ ...existingErrors, fimInvalido: 'O fim do turno deve ser posterior ao início.' });
        } else {
          const existingErrors = fimControl?.errors || {};
          delete existingErrors['fimInvalido'];
          fimControl?.setErrors(Object.keys(existingErrors).length ? existingErrors : null);
        }
      }
    });

    // Revalidar 'inicio' e disparar validação assíncrona sempre que o valor de 'fim' mudar
    this.turnoForm.get('fim')?.valueChanges.subscribe(() => {
      this.turnoForm.get('inicio')?.updateValueAndValidity({ onlySelf: true });
    });
  }

  inicioValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const inicio = control.value;
      const dataAtual = new Date();
      const dataInicio = new Date(inicio);
      
      // if (dataInicio <= dataAtual) {
      //   return { inicioInvalido: 'A data de inicio deve ser posterior a data atual' }; 
      // }

      return null;
    };
  }

  fimValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const inicio = this.turnoForm?.get('inicio')?.value;
      const fim = control.value;

      if (!inicio || !fim) {
        return null; 
      }

      const dataInicio = new Date(inicio).getTime();
      const dataFim = new Date(fim).getTime();

      const errors: ValidationErrors = {};
      
      if (dataFim <= dataInicio) {
        errors['fimInvalido'] = 'O fim do turno deve ser posterior ao início.';
      }
      
      const duracaoMs = dataFim - dataInicio ;
      if (duracaoMs > 8 * 60 * 60 * 1000) { 
        errors['duracaoInvalido'] = 'A duração do turno não pode exceder 8 horas.'; 
      }

      return Object.keys(errors).length ? errors : null;
    };
  }

  motoristaTurnoValidator(): ValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const inicio = control.value;
      const fim = this.turnoForm?.get('fim')?.value;
      const motorista = this.motoristaService.getMotoristaLogado();

      if (!motorista || !inicio) {
        return of(null);
      }

      const fimParaValidacao = fim || new Date(inicio).setHours(new Date(inicio).getHours() + 1);

      return this.turnoService.checkMotoristaTurno(motorista._id, inicio, fimParaValidacao).pipe(
        map(() => null),
        catchError((err) => {
          if (err.error?.message) {
            return of({ motoristaTurnoInvalido: err.error.message });
          }
          return of({ motoristaTurnoInvalido: 'Erro ao verificar turno do motorista.' });
        })
      );
    };
  }
  
  requisitarTaxi(taxiId: String) {
    const { inicio, fim } = this.turnoForm.value;
    const motorista = this.motoristaService.getMotoristaLogado();

    if (!motorista) {
      console.error('Erro: motorista não autenticado');
      this.snackBar.open('Erro: motorista não autenticado', 'Fechar', {duration: 3000});
      return;
    }

    this.turnoService.addTurno({ inicio, fim, taxiId, motoristaId: motorista._id }).subscribe({
      next: (res) => {
        this.snackBar.open('Turno requisitado com sucesso', 'Fechar', {duration: 3000});
        console.log('Turno criado:', res);
        this.router.navigate(['/list-turnos']);
      },
      error: (err) => {
        console.error('Erro ao requisitar turno', err);
        if (err.error?.message) {
          this.snackBar.open(err.error.message, 'Fechar', { duration: 3000 });
        } else {
          this.snackBar.open('Erro ao requisitar turno', 'Fechar', { duration: 3000 });
        }
      }
    });
  }


  onSubmit() {
    if (this.turnoForm.valid) {
      const { inicio, fim } = this.turnoForm.value;

      this.isLoading = true;
      this.turnoService.getAllAvailableTaxis(inicio, fim).subscribe({
        next: (taxis) => {
          this.taxisDisponiveis = taxis;
          this.snackBar.open('Taxis disponiveis carregados com sucesso', 'Fechar', {duration: 3000});
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erro ao carregar taxis disponiveis', err);
          this.snackBar.open('Erro ao carregar taxis disponiveis', 'Fechar', {duration: 3000});
          this.isLoading = false;
        }
      });
    } else {
      console.log('Formulário inválido');
    }
  }
}
