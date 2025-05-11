import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { TurnoService } from 'src/app/services/turno.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MotoristaService } from 'src/app/services/motorista.service';

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
    private motoristaService: MotoristaService
  ) {}

  ngOnInit(): void {
    this.turnoForm = this.fb.group({
      inicio: ['', [Validators.required]],
      fim: ['', [Validators.required, this.fimValidator()]],
    });
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
      const duracaoMs = dataFim - dataInicio ;

      if (dataFim <= dataInicio) {
        return { fimInvalido: 'O fim do turno deve ser posterior ao inicio do mesmo' }; 
      }

      if (duracaoMs > 8 * 60 * 60 * 1000) { 
        return { duracaoInvalido: 'A duração do turno nao pode exceder 8 horas' }; 
      }

      return null;
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
    console.log('Motorista logado:', motorista);
    console.log('Payload enviado:', { inicio, fim, taxiId, motoristaId: motorista._id });

    this.turnoService.addTurno({ inicio, fim, taxiId, motoristaId: motorista._id }).subscribe({
      next: (res) => {
        this.snackBar.open('Turno requisitado com sucesso', 'Fechar', {duration: 3000});
        console.log('Turno criado:', res);
      },
      error: (err) => {
        console.error('Erro ao requisitar turno', err);
        this.snackBar.open('Erro ao requisitar turno', 'Fechar', {duration: 3000});
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
