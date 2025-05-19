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
  generoOpcoes: Genero[] = ['feminino', 'masculino']; // Ou ['Feminino', 'Masculino'] dependendo do que o backend espera/retorna
  
  currentYear = new Date().getFullYear();
  minBirthYear = this.currentYear - 100; // Exemplo: idade máxima de 100 anos
  maxBirthYear = this.currentYear - 18;  // Idade mínima de 18 anos

  isLoadingLocality = false;
  isLoading = true; // Flag para o estado de carregamento inicial dos dados do motorista
  motoristaId: string | null = null;
  errorMessage: string | null = null; // Para mostrar mensagens de erro no template

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private motoristaService: MotoristaService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute // Para ler o ID da rota
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
              return of(null); // Retorna um observable nulo para o subscribe não quebrar
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
        // Se motoristaData for null mas tínhamos um ID, significa que houve erro no carregamento
        this.snackBar.open(this.errorMessage || 'Erro ao carregar motorista.', 'Fechar', { duration: 5000 });
        // Opcionalmente, redirecionar se o erro for crítico
        // this.router.navigate(['/list-motoristas']);
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
        Validators.min(this.minBirthYear), // Ano mínimo (ex: 1925)
        Validators.max(this.maxBirthYear), // Ano máximo (ex: 2007 para 18 anos em 2025)
        birthYearValidator // Validador customizado para não ser ano futuro
      ]],
      morada: this.fb.group({
        rua: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
        numeroPorta: ['', Validators.maxLength(10)], // Não obrigatório
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
      genero: motorista.genero, // Assegure que o valor corresponde às opções (ex: 'feminino')
      anoNascimento: motorista.anoNascimento,
      morada: {
        rua: motorista.morada.rua,
        numeroPorta: motorista.morada.numeroPorta || '', // Tratar null/undefined
        codigoPostal: motorista.morada.codigoPostal,
        localidade: motorista.morada.localidade
      },
      cartaConducao: motorista.cartaConducao
    });

    // Habilitar e verificar localidade se o código postal já estiver preenchido e válido
    const cpControl = this.motoristaForm.get('morada.codigoPostal');
    if (cpControl && cpControl.value && cpControl.valid) {
      this.motoristaForm.get('morada.localidade')?.enable();
      // Opcional: Poderia disparar uma nova busca de localidade se a lógica de `setupPostalCodeLookup` não cobrir o preenchimento inicial.
      // Mas o `patchValue` já deve preencher a localidade se ela veio do backend.
    } else {
        this.motoristaForm.get('morada.localidade')?.disable();
    }
  }

  private setupPostalCodeLookup(): void {
    const cpControl = this.motoristaForm.get('morada.codigoPostal');
    const localidadeControl = this.motoristaForm.get('morada.localidade');

    if (cpControl && localidadeControl) {
      cpControl.valueChanges.pipe(
        debounceTime(400), // Espera 400ms após o utilizador parar de digitar
        distinctUntilChanged(), // Só emite se o valor realmente mudou
        tap(() => { // Ações antes de chamar o serviço
          this.isLoadingLocality = true;
          localidadeControl.setValue(''); // Limpa localidade anterior
          if (cpControl.invalid || !cpControl.value) {
             localidadeControl.disable(); // Desabilita se CP estiver inválido ou vazio
          }
        }),
        // Só continua se o código postal for válido e tiver algum valor
        filter(cpValue => cpControl.valid && !!cpValue),
        switchMap(cpValue => // Cancela chamadas anteriores se o user digitar rápido
          this.motoristaService.getLocalityFromPostalCode(cpValue).pipe(
            catchError(error => {
              console.error('Erro ao buscar localidade:', error);
              this.snackBar.open('Localidade não encontrada para o código postal fornecido.', 'Fechar', { duration: 3000 });
              localidadeControl.enable(); // Habilita para entrada manual em caso de erro
              return of(null); // Para não quebrar a cadeia do Observable
            })
          )
        ),
        takeUntil(this.destroy$) // Cancela a subscrição quando o componente é destruído
      ).subscribe(result => {
        this.isLoadingLocality = false;
        localidadeControl.enable(); // Habilita o campo após a busca
        if (result && result.localidade) {
          localidadeControl.setValue(result.localidade);
        } else {
          // Permite entrada manual se não encontrar ou se o CP for inválido e o user quiser preencher
        }
      });

      // Verificação inicial: se já existe um código postal válido ao carregar o formulário
      if (cpControl.valid && cpControl.value) {
        this.triggerPostalCodeFetch(cpControl.value, localidadeControl);
      } else if (cpControl.value === '' || cpControl.invalid) { // Se estiver vazio ou inválido, desabilita localidade
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
      } else { // Se o CP não for válido ou estiver vazio, limpa e desabilita para entrada manual.
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
        localidadeControl.enable(); // Habilita mesmo em erro
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
        // _id não é enviado no corpo da atualização, é parte da URL
        ...this.motoristaForm.value,
        morada: { // Garante que o objeto morada está completo
            ...this.motoristaForm.value.morada,
            localidade: this.motoristaForm.get('morada.localidade')?.value // Pega o valor mesmo se desabilitado
        },
        anoNascimento: Number(this.motoristaForm.value.anoNascimento) // Garante que é número
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
      // Este caso não deveria acontecer se a lógica de carregamento estiver correta
      this.snackBar.open('ID do motorista não encontrado. Não é possível atualizar.', 'Fechar', { duration: 3000 });
      this.isLoading = false;
    }
  }

  // Getters para facilitar o acesso aos controlos do formulário no template HTML
  get nif() { return this.motoristaForm.get('nif'); }
  get nome() { return this.motoristaForm.get('nome'); }
  get genero() { return this.motoristaForm.get('genero'); }
  get anoNascimento() { return this.motoristaForm.get('anoNascimento'); }
  get cartaConducao() { return this.motoristaForm.get('cartaConducao'); }
  get morada() { return this.motoristaForm.get('morada'); } // FormGroup aninhado
  get rua() { return this.morada?.get('rua'); }
  get numeroPorta() { return this.morada?.get('numeroPorta'); }
  get codigoPostal() { return this.morada?.get('codigoPostal'); }
  get localidade() { return this.morada?.get('localidade'); }
}