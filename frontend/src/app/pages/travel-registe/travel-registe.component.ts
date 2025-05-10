import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PedidoService } from '../../services/pedido.service';
import { MotoristaService } from '../../services/motorista.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-travel-registe',
  templateUrl: './travel-registe.component.html',
  styleUrls: ['./travel-registe.component.css']
})
export class TravelRegisteComponent implements OnInit {
  travelForm: FormGroup;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private pedidoService: PedidoService,
    private motoristaService: MotoristaService,
    private location: Location
  ) {
    this.travelForm = this.fb.group({
    origem: [{ value: '', disabled: true }],
    destino: [{ value: '', disabled: true }],
    data: [{ value: '', disabled: true }],
    hora: [{ value: '', disabled: true }],
    passageiros: [1, [Validators.required, Validators.min(1)]],
    observacoes: [''],
    kmPercorridos: [{ value: '', disabled: true }],
    precoFinal: [{ value: '', disabled: true }],    
  });
  }

  ngOnInit() {
  const motorista = this.motoristaService.getMotoristaLogado();
  const agora = new Date();

  this.travelForm.patchValue({
    data: agora.toISOString().substring(0, 10),
    hora: agora.toTimeString().substring(0, 5)
  });

  if (motorista && motorista._id) {
    this.pedidoService.getUltimoPedidoAceiteDoMotorista(motorista._id).subscribe(pedidoAceite => {
      console.log('Pedido aceite recebido:', pedidoAceite);
      if (pedidoAceite) {
        this.travelForm.patchValue({
          origem: this.formatarMorada(pedidoAceite.localizacaoAtual),
          destino: this.formatarMorada(pedidoAceite.destino),
          passageiros: pedidoAceite.numeroPessoas || 1
        });
      } else {
        console.warn('Nenhum pedido aceite encontrado para este motorista.');
      }
    }, err => {
      console.error('Erro ao obter pedido aceite:', err);
    });
  } else {
    console.warn('Motorista não autenticado.');
  }
}

  get f() {
    return this.travelForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.travelForm.invalid) {
      return;
    }
    console.log('Viagem registada:', this.travelForm.value);
    this.travelForm.reset();
    this.submitted = false;
  }

  onReset() {
    this.travelForm.reset();
    this.submitted = false;
  }

  formatarMorada(morada: any): string {
    if (!morada) return '';
    return `${morada.rua || ''} ${morada.numeroPorta || ''}, ${morada.codigoPostal || ''} ${morada.localidade || ''}`.trim();
  }

  voltarAtras(): void {
    this.location.back();
  }
}