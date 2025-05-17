import { Component, OnInit, OnDestroy } from '@angular/core'; 
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MotoristaService } from '../../../services/motorista.service';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError, filter, takeUntil } from 'rxjs/operators';
import { Genero } from 'src/app/models/constants';

@Component({
  selector: 'app-add-motorista',
  templateUrl: './add-motorista.component.html',
  styleUrls: ['./add-motorista.component.css']
})
export class AddMotoristaComponent implements OnInit, OnDestroy { 

  motoristaForm!: FormGroup;
  generoOpcoes: Genero[] = ['feminino', 'masculino'];
  maxYear = new Date().getFullYear() - 18;
  isLoadingLocality = false;

  errorMessage: string = '';
  successMessage: string = '';

  // Subject para ajudar a cancelar subscrições quando o componente é destruído
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private motoristaService: MotoristaService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.setupPostalCodeLookup();
  }

  
  ngOnDestroy(): void {
    this.destroy$.next(); 
    this.destroy$.complete(); 
  }

  private createForm(): void {
    this.motoristaForm = this.fb.group({
      nif: ['', [ Validators.required, Validators.pattern(/^[0-9]{9}$/) ]],
      nome: ['', [Validators.required, (control: AbstractControl) => {
        const value = control.value?.trim() || '';
        return value === '' ? { required: true } : null;
      }]],
      genero: ['', Validators.required],
      anoNascimento: ['', [ 
        Validators.required, 
        Validators.max(this.maxYear),
        Validators.min(0)
      ]],
      morada: this.fb.group({
        rua: ['', [Validators.required, (control: AbstractControl) => {
          const value = control.value?.trim() || '';
          return value === '' ? { required: true } : null;
        }]],
        numeroPorta: [''],
        codigoPostal: ['', [ Validators.required, Validators.pattern(/^\d{4}-\d{3}$/) ]],
        localidade: ['', [Validators.required, (control: AbstractControl) => {
          const value = control.value?.trim() || '';
          return value === '' ? { required: true } : null;
        }]]
      }),
      cartaConducao: ['', [Validators.required, (control: AbstractControl) => {
        const value = control.value?.trim() || '';
        return value === '' ? { required: true } : null;
      }]]
    });
  }

  // Configura a lógica de consulta automática do código postal
  private setupPostalCodeLookup(): void {
    const cpControl = this.motoristaForm.get('morada.codigoPostal');

    if (cpControl) {
      cpControl.valueChanges.pipe(
        debounceTime(400),
        distinctUntilChanged(), 
        filter(() => cpControl.valid),
        // Ações antes de chamar o serviço: mostra loading, limpa localidade anterior
        tap(() => {
          this.isLoadingLocality = true;
          this.motoristaForm.get('morada.localidade')?.setValue(''); 
        }),
        // Chama o serviço; switchMap cancela chamadas anteriores se o user digitar rápido
        switchMap(cpValue =>
          this.motoristaService.getLocalityFromPostalCode(cpValue).pipe(
            catchError(error => {
              
              console.error('Erro ao buscar localidade:', error);
              this.isLoadingLocality = false; 
              return of(null);
            })
          )
        ),
        // Cancela esta subscrição quando o componente for destruído
        takeUntil(this.destroy$)
      ).subscribe(result => {
        this.isLoadingLocality = false;
        if (result && result.localidade) {
          this.motoristaForm.get('morada.localidade')?.setValue(result.localidade);
          console.log(`Localidade encontrada para ${cpControl.value}: ${result.localidade}`);
        } else {
          console.log(`Localidade não encontrada para ${cpControl.value}`);
        }
      });
    }
  }

  onPostalCodeChange(event: any): void {
    const cp = event.target.value;
    if (/^\d{4}-\d{3}$/.test(cp)) {
      this.isLoadingLocality = true;
      this.motoristaService.getLocalityFromPostalCode(cp).subscribe({
        next: (response) => {
          this.isLoadingLocality = false;
          if (response && response.localidade) {
            this.motoristaForm.get('morada.localidade')?.setValue(response.localidade);
          }
        },
        error: (error) => {
          this.isLoadingLocality = false;
          console.error('Erro ao buscar localidade:', error);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.motoristaForm.valid) {
      const formValue = { ...this.motoristaForm.value };
      // Trim all text fields
      formValue.nome = formValue.nome.trim();
      formValue.morada.rua = formValue.morada.rua.trim();
      if (formValue.morada.numeroPorta) {
        formValue.morada.numeroPorta = formValue.morada.numeroPorta.trim();
      }
      formValue.morada.localidade = formValue.morada.localidade.trim();
      formValue.cartaConducao = formValue.cartaConducao.trim();
      formValue.anoNascimento = Number(formValue.anoNascimento);

      this.motoristaService.addMotorista(formValue).subscribe({
        next: (novoMotorista) => {
          this.snackBar.open(`Motorista '${novoMotorista.nome}' adicionado com sucesso!`, 'Fechar', { duration: 3000 });
          this.router.navigate(['/list-motoristas']);
        },
        error: (err) => {
          console.error('Erro ao adicionar motorista:', err);
          const message = err.error?.message || err.message || 'Ocorreu um erro desconhecido.';
          this.snackBar.open(`${message}`, 'Fechar', { duration: 5000 });
        }
      });
    } else {
      this.motoristaForm.markAllAsTouched();
      this.snackBar.open('Por favor, corrija os erros no formulário.', 'Fechar', { duration: 3000 });
    }
  }

  get nif() { return this.motoristaForm.get('nif'); }
  get nome() { return this.motoristaForm.get('nome'); }
  get genero() { return this.motoristaForm.get('genero'); }
  get anoNascimento() { return this.motoristaForm.get('anoNascimento'); }
  get cartaConducao() { return this.motoristaForm.get('cartaConducao'); }
  get morada() { return this.motoristaForm.get('morada'); }
  get rua() { return this.morada?.get('rua'); }
  get numeroPorta() { return this.morada?.get('numeroPorta'); }
  get codigoPostal() { return this.morada?.get('codigoPostal'); }
  get localidade() { return this.morada?.get('localidade'); }
}