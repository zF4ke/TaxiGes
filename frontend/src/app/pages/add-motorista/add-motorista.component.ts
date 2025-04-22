import { Component, OnInit, OnDestroy } from '@angular/core'; 
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MotoristaService } from '../../services/motorista.service';
import { Genero } from '../../models/motorista.model';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError, filter, takeUntil } from 'rxjs/operators';

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
      nome: ['', Validators.required],
      genero: ['', Validators.required],
      anoNascimento: ['', [ Validators.required, Validators.min(1900), Validators.max(this.maxYear) ]],
      cartaConducao: ['', Validators.required],
      morada: this.fb.group({
        rua: ['', Validators.required],
        numeroPorta: [''],
        codigoPostal: ['', [ Validators.required, Validators.pattern(/^\d{4}-\d{3}$/) ]],
        // A localidade começa vazia e será preenchida
        localidade: ['', Validators.required]
        // Poderias adicionar { updateOn: 'blur' } ao codigoPostal se preferires que a validação/lookup só ocorra ao sair do campo
      })
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


  onSubmit(): void {
    if (this.motoristaForm.valid) {
      const formValue = { ...this.motoristaForm.value };
      formValue.anoNascimento = Number(formValue.anoNascimento);

      this.motoristaService.addMotorista(formValue).subscribe({
        next: (novoMotorista) => {
          this.snackBar.open(`Motorista '${novoMotorista.nome}' adicionado com sucesso!`, 'Fechar', { duration: 3000 });
          this.router.navigate(['/list-motoristas']);
        },
        error: (err) => {
          console.error('Erro ao adicionar motorista:', err);
          const message = err.error?.message || err.message || 'Ocorreu um erro desconhecido.';
          this.snackBar.open(`Erro: ${message}`, 'Fechar', { duration: 5000 });
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