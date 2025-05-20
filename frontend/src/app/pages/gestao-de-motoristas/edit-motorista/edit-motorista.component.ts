// src/app/pages/gestao-de-motoristas/edit-motorista/edit-motorista.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MotoristaService } from '../../../services/motorista.service';
import { Motorista } from '../../../models/motorista.model';
import { Genero } from 'src/app/models/constants'; // Certifique-se que este caminho está correto
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError, filter, takeUntil } from 'rxjs/operators';

// Validador customizado para o ano de nascimento (para evitar anos no futuro)
export function birthYearValidator(control: AbstractControl): { [key: string]: any } | null {
  const year = control.value;
  if (year && year > new Date().getFullYear()) {
    return { 'invalidYear': true };
  }
  return null;
}

@Component({
  selector: 'app-edit-motorista',
  templateUrl: './edit-motorista.component.html',
  styleUrls: ['./edit-motorista.component.css']
})
export class EditMotoristaComponent implements OnInit, OnDestroy {

  motoristaForm!: FormGroup;
  generoOpcoes: Genero[] = ['feminino', 'masculino']; 
  
  currentYear = new Date().getFullYear();
  minBirthYear = this.currentYear - 100; 
  maxBirthYear = this.currentYear - 18;  

  isLoadingLocality = false;
  isLoading = true; 
  motoristaId: string | null = null;
  errorMessage: string | null = null; 

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private motoristaService: MotoristaService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute 
  ) {}

  ngOnInit(): void {
    this.createForm(); // É importante criar o formulário antes de tentar preenchê-lo

    this.route.paramMap.pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        this.motoristaId = params.get('id');
        if (this.motoristaId) {
          this.isLoading = true;
          this.errorMessage = null;
          return this.motoristaService.getMotoristaById(this.motoristaId).pipe(
            catchError(err => {
              console.error('Erro ao carregar dados do motorista:', err);
              this.errorMessage = err.error?.message || 'Não foi possível carregar os dados do motorista para edição.';
              this.isLoading = false;
              return of(null);
            })
          );
        } else {
          this.errorMessage = 'ID do motorista não fornecido na rota.';
          this.isLoading = false;
          return of(null);
        }
      })
    ).subscribe(motoristaData => {
      if (motoristaData) {
        this.populateForm(motoristaData);
        this.isLoading = false;
      } else if (this.motoristaId) {
        this.snackBar.open(this.errorMessage || 'Erro ao carregar motorista.', 'Fechar', { duration: 5000 });
      } else {
        // Não há ID, erro já tratado, talvez redirecionar
         this.snackBar.open(this.errorMessage || 'ID do motorista não encontrado.', 'Fechar', { duration: 3000 });
         this.router.navigate(['/list-motoristas']);
      }
    });

    this.setupPostalCodeLookup();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): void {
    this.motoristaForm = this.fb.group({
      nif: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      genero: ['', Validators.required],
      anoNascimento: ['', [
        Validators.required,
        Validators.min(this.minBirthYear),
        Validators.max(this.maxBirthYear), 
        birthYearValidator 
      ]],
      morada: this.fb.group({
        rua: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
        numeroPorta: ['', Validators.maxLength(10)], 
        codigoPostal: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{3}$/)]],
        localidade: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(2), Validators.maxLength(100)]]
      }),
      cartaConducao: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]]
    });
  }

  private populateForm(motorista: Motorista): void {
    this.motoristaForm.patchValue({
      nif: motorista.nif,
      nome: motorista.nome,
      genero: motorista.genero, 
      anoNascimento: motorista.anoNascimento,
      morada: {
        rua: motorista.morada.rua,
        numeroPorta: motorista.morada.numeroPorta || '', 
        codigoPostal: motorista.morada.codigoPostal,
        localidade: motorista.morada.localidade
      },
      cartaConducao: motorista.cartaConducao
    });

    // Habilitar e verificar localidade se o código postal já estiver preenchido e válido
    const cpControl = this.motoristaForm.get('morada.codigoPostal');
    if (cpControl && cpControl.value && cpControl.valid) {
      this.motoristaForm.get('morada.localidade')?.enable();
    } else {
        this.motoristaForm.get('morada.localidade')?.disable();
    }
  }

  private setupPostalCodeLookup(): void {
    const cpControl = this.motoristaForm.get('morada.codigoPostal');
    const localidadeControl = this.motoristaForm.get('morada.localidade');

    if (cpControl && localidadeControl) {
      cpControl.valueChanges.pipe(
        debounceTime(400), 
        distinctUntilChanged(), 
        tap(() => { // Ações antes de chamar o serviço
          this.isLoadingLocality = true;
          localidadeControl.setValue(''); // Limpa localidade anterior
          if (cpControl.invalid || !cpControl.value) {
             localidadeControl.disable(); // Desabilita se CP estiver inválido ou vazio
          }
        }),
        // Só continua se o código postal for válido e tiver algum valor
        filter(cpValue => cpControl.valid && !!cpValue),
        switchMap(cpValue => 
          this.motoristaService.getLocalityFromPostalCode(cpValue).pipe(
            catchError(error => {
              console.error('Erro ao buscar localidade:', error);
              this.snackBar.open('Localidade não encontrada para o código postal fornecido.', 'Fechar', { duration: 3000 });
              localidadeControl.enable();
              return of(null); 
            })
          )
        ),
        takeUntil(this.destroy$) 
      ).subscribe(result => {
        this.isLoadingLocality = false;
        localidadeControl.enable(); 
        if (result && result.localidade) {
          localidadeControl.setValue(result.localidade);
        } else {
        }
      });

      // Verificação inicial: se já existe um código postal válido ao carregar o formulário
      if (cpControl.valid && cpControl.value) {
        this.triggerPostalCodeFetch(cpControl.value, localidadeControl);
      } else if (cpControl.value === '' || cpControl.invalid) {
        localidadeControl.disable();
      }
    }
  }

  // Função chamada no evento (blur) do campo código postal
  onPostalCodeChange(event: FocusEvent | Event): void {
    const cpValue = (event.target as HTMLInputElement).value;
    const cpControl = this.motoristaForm.get('morada.codigoPostal');
    const localidadeControl = this.motoristaForm.get('morada.localidade');

    if (cpControl && localidadeControl) {
      if (cpControl.valid && cpValue) { // Verifica se o formato do CP é válido e se há valor
        this.triggerPostalCodeFetch(cpValue, localidadeControl);
      } else { 
        localidadeControl.setValue('');
        localidadeControl.disable();
      }
    }
  }

  // Função auxiliar para buscar localidade
  private triggerPostalCodeFetch(cp: string, localidadeControl: AbstractControl | null): void {
    if (!localidadeControl) return;

    this.isLoadingLocality = true;
    localidadeControl.disable(); // Desabilita enquanto busca
    this.motoristaService.getLocalityFromPostalCode(cp).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.isLoadingLocality = false;
        localidadeControl.enable(); // Habilita após a busca
        if (response && response.localidade) {
          localidadeControl.setValue(response.localidade);
        } else {
          localidadeControl.setValue(''); // Limpa se não encontrar para permitir digitação
           this.snackBar.open('Localidade não encontrada. Pode inseri-la manualmente.', 'Fechar', { duration: 3000 });
        }
      },
      error: (error) => {
        this.isLoadingLocality = false;
        localidadeControl.enable(); 
        localidadeControl.setValue('');
        console.error('Erro ao buscar localidade:', error);
        this.snackBar.open('Erro ao buscar localidade. Pode inseri-la manualmente.', 'Fechar', { duration: 3000 });
      }
    });
  }

  onSubmit(): void {
    if (this.motoristaForm.invalid) {
      this.motoristaForm.markAllAsTouched(); // Para mostrar os erros de validação
      this.snackBar.open('Por favor, corrija os erros no formulário.', 'Fechar', { duration: 3000 });
      return;
    }

    // Verificar se houve alguma alteração no formulário
    if (this.motoristaForm.pristine && !this.motoristaForm.dirty) {
        this.snackBar.open('Nenhuma alteração foi feita no formulário.', 'Fechar', { duration: 3000 });
        return;
    }

    if (this.motoristaId) {
      this.isLoading = true; // Ativa o loading para o processo de submissão
      const motoristaDataToUpdate: Motorista = {
        ...this.motoristaForm.value,
        morada: {
            ...this.motoristaForm.value.morada,
            localidade: this.motoristaForm.get('morada.localidade')?.value
        },
        anoNascimento: Number(this.motoristaForm.value.anoNascimento) 
      };
      
      // Remover espaços em branco desnecessários
      motoristaDataToUpdate.nome = motoristaDataToUpdate.nome.trim();
      motoristaDataToUpdate.morada.rua = motoristaDataToUpdate.morada.rua.trim();
      if (motoristaDataToUpdate.morada.numeroPorta) {
        motoristaDataToUpdate.morada.numeroPorta = motoristaDataToUpdate.morada.numeroPorta.trim();
      }
      motoristaDataToUpdate.morada.localidade = motoristaDataToUpdate.morada.localidade.trim();
      motoristaDataToUpdate.cartaConducao = motoristaDataToUpdate.cartaConducao.trim();


      this.motoristaService.updateMotorista(this.motoristaId, motoristaDataToUpdate)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (motoristaAtualizado) => {
            this.isLoading = false;
            this.snackBar.open(`Motorista '${motoristaAtualizado.nome}' atualizado com sucesso!`, 'Fechar', {
              duration: 3000,
              verticalPosition: 'top'
            });
            this.router.navigate(['/list-motoristas']); // Navega de volta para a lista
          },
          error: (err) => {
            this.isLoading = false;
            console.error('Erro ao atualizar motorista:', err);
            this.snackBar.open(err.error?.message || 'Ocorreu um erro ao tentar atualizar o motorista.', 'Fechar', {
              duration: 5000,
              verticalPosition: 'top'
            });
          }
        });
    } else {
      this.snackBar.open('ID do motorista não encontrado. Não é possível atualizar.', 'Fechar', { duration: 3000 });
      this.isLoading = false;
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