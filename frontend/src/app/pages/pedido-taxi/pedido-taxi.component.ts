import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { PedidoService } from '../../services/pedido.service';
import { GeocodingService } from '../../services/geocoding.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { NivelConforto } from '../../models/nivel-conforto.type';
import { Genero } from '../../models/pessoa.model';
import { MapaSelecionarDestinoComponent } from '../mapa-selecionar-destino/mapa-selecionar-destino.component';

@Component({
  selector: 'app-pedido-taxi',
  templateUrl: './pedido-taxi.component.html',
  styleUrls: ['./pedido-taxi.component.css']
})
export class PedidoTaxiComponent implements OnInit {
  pedidoForm!: FormGroup;
  niveisConforto: NivelConforto[] = ['básico', 'luxuoso'];
  generoOpcoes: Genero[] = ['feminino', 'masculino'];
  maxAno = new Date().getFullYear();

  @ViewChild('mapaDestino') mapaDestinoComponent!: MapaSelecionarDestinoComponent;

  constructor(
    private fb: FormBuilder,
    private pedidoService: PedidoService,
    private geocodingService: GeocodingService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.pedidoForm = this.fb.group({
      cliente: this.fb.group({
        nif: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
        nome: ['', [Validators.required, (control: AbstractControl) => control.value?.trim() === '' ? { required: true } : null]],
        genero: ['', Validators.required],
        anoNascimento: ['', [Validators.required, Validators.min(0), Validators.max(this.maxAno)]]
      }),
      localizacaoAtual: this.fb.group({
        rua: ['', [Validators.required, (control: AbstractControl) => control.value?.trim() === '' ? { required: true } : null]],
        numeroPorta: [''],
        codigoPostal: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{3}$/)]],
        localidade: ['', [Validators.required, (control: AbstractControl) => control.value?.trim() === '' ? { required: true } : null]]
      }),
      destino: this.fb.group({
        rua: ['', [Validators.required, (control: AbstractControl) => control.value?.trim() === '' ? { required: true } : null]],
        numeroPorta: [''],
        codigoPostal: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{3}$/)]],
        localidade: ['', [Validators.required, (control: AbstractControl) => control.value?.trim() === '' ? { required: true } : null]]
      }),
      nivelConforto: ['', Validators.required],
      numeroPessoas: [1, [Validators.required, Validators.min(1)]]
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords;
          this.geocodingService.reverseGeocode(latitude, longitude).subscribe({
            next: data => {
              this.pedidoForm.patchValue({
                localizacaoAtual: {
                  rua: data.rua,
                  codigoPostal: data.codigoPostal,
                  localidade: data.localidade
                }
              });
            },
            error: err => console.warn('Erro ao obter morada via Nominatim:', err)
          });
        },
        err => console.warn('Geolocalização recusada ou indisponível:', err)
      );
    }
  }

  abrirSelecaoMapa(): void {
    this.mapaDestinoComponent?.abrirMapa();
  }

  preencherDestino(data: { rua: string; localidade: string; codigoPostal: string }) {
    this.pedidoForm.patchValue({
      destino: {
        rua: data.rua,
        codigoPostal: data.codigoPostal,
        localidade: data.localidade
      }
    });
  }

  onSubmit(): void {
    if (!this.pedidoForm.valid) {
      this.snackBar.open('Por favor, corrija os erros no formulário.', 'Fechar', { duration: 3000 });
      return;
    }

    const formValue = { ...this.pedidoForm.value };
    formValue.cliente.nome = formValue.cliente.nome.trim();
    formValue.localizacaoAtual.rua = formValue.localizacaoAtual.rua.trim();
    formValue.localizacaoAtual.localidade = formValue.localizacaoAtual.localidade.trim();
    formValue.destino.rua = formValue.destino.rua.trim();
    formValue.destino.localidade = formValue.destino.localidade.trim();
    if (formValue.localizacaoAtual.numeroPorta) {
      formValue.localizacaoAtual.numeroPorta = formValue.localizacaoAtual.numeroPorta.trim();
    }
    if (formValue.destino.numeroPorta) {
      formValue.destino.numeroPorta = formValue.destino.numeroPorta.trim();
    }

    this.pedidoService.createPedido(formValue).subscribe({
      next: pedidoCriado => {
        this.snackBar.open('Pedido criado com sucesso!', 'Fechar', { duration: 3000 });
        this.router.navigate(['/pedido', pedidoCriado._id]);
      },
      error: err => {
        console.error(err);
        const msg = err.error?.message || 'Erro ao criar pedido.';
        this.snackBar.open(msg, 'Fechar', { duration: 5000 });
      }
    });
  }

  get nif() { return this.pedidoForm.get('cliente.nif'); }
  get nome() { return this.pedidoForm.get('cliente.nome'); }
  get genero() { return this.pedidoForm.get('cliente.genero'); }
  get anoNascimento() { return this.pedidoForm.get('cliente.anoNascimento'); }
  get nivelConforto() { return this.pedidoForm.get('nivelConforto'); }
  get numeroPessoas() { return this.pedidoForm.get('numeroPessoas'); }
}
