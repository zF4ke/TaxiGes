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
      origem: ['', Validators.required],
      destino: ['', Validators.required],
      data: ['', Validators.required],
      hora: ['', Validators.required],
      passageiros: [1, [Validators.required, Validators.min(1)]],
      observacoes: ['']
    });
  }

  ngOnInit() {
    const motorista = this.motoristaService.getMotoristaLogado();
    if (motorista && motorista._id) {
      this.pedidoService.getUltimoPedidoAceiteDoMotorista(motorista._id).subscribe(pedidoAceite => {
        if (pedidoAceite) {
            const agora = new Date();
            this.travelForm.patchValue({
             origem: this.formatarMorada(pedidoAceite.localizacaoAtual),
             destino: this.formatarMorada(pedidoAceite.destino),
             data: agora.toISOString().substring(0, 10),
             hora: agora.toTimeString().substring(0, 5),
             passageiros: pedidoAceite.numeroPessoas || 1
        });
        }
      });
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