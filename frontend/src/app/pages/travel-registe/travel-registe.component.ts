import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PedidoService } from '../../services/pedido.service';
import { MotoristaService } from '../../services/motorista.service';
import { TravelService } from '../../services/travel.service';
import { TurnoService } from '../../services/turno.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-travel-registe',
  templateUrl: './travel-registe.component.html',
  styleUrls: ['./travel-registe.component.css']
})
export class TravelRegisteComponent implements OnInit {
  travelForm: FormGroup;
  submitted = false;
  pedidoAceite: any; // Guarda o pedido aceite para usar cliente/turno se necessário

  constructor(
    private fb: FormBuilder,
    private pedidoService: PedidoService,
    private motoristaService: MotoristaService,
    private travelService: TravelService,
    private location: Location,
    private turnoService: TurnoService,
    private router: Router

  ) {
    this.travelForm = this.fb.group({
      origem: [{ value: '', disabled: true }],
      destino: [{ value: '', disabled: true }],
      data: [{ value: '', disabled: true }],
      hora: [{ value: '', disabled: true }],
      passageiros: [1, [Validators.required, Validators.min(1)]],
      kmPercorridos: [{ value: '', disabled: true }],
      precoFinal: [{ value: '', disabled: true }]
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
          this.pedidoAceite = pedidoAceite; 
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

  const form = this.travelForm.getRawValue();
  const motorista = this.motoristaService.getMotoristaLogado();

  if (!motorista || !motorista._id) {
    alert('Motorista não autenticado.');
    return;
  }

  this.turnoService.getTurnoAtivo(motorista._id).subscribe({
    next: (turno) => {
      if (!turno) {
        alert('Nenhum turno ativo encontrado para este motorista.');
        return;
      }

      if (!this.pedidoAceite) {
        alert('Nenhum pedido aceite encontrado.');
        return;
      }

      const dados = {
        moradaInicio: form.origem,
        moradaFim: form.destino,
        numeroPessoas: form.passageiros,
        cliente: this.pedidoAceite?.cliente,
        turno: turno
      };

      console.log('Dados da viagem:', dados);
      console.log('Motorista:', motorista);
      console.log('Turno:', turno);
      console.log('Pedido aceite:', this.pedidoAceite);

      this.travelService.criarViagem(dados).subscribe({
        next: (res) => {
          console.log('Viagem criada com sucesso:', res);

          this.router.navigate(['/viagem/resumo', res._id], {
            state: { 
              // destino: form.destino,
              // precoFinal: res.precoFinal ?? res.preco,
              // kmPercorridos: res.kmPercorridos ?? res.quilometrosPercorridos
              viagem: res,
              cliente: this.pedidoAceite.cliente,
              turno: turno
            }
          });
        },
        error: (err) => {
          console.error('Erro ao criar viagem:', err);
          alert('Ocorreu um erro ao registar a viagem. Por favor, tente novamente.');
        }
      });
    },
        error: (err) => {
          console.error('Erro ao obter turno ativo:', err);
          alert('Ocorreu um erro ao obter o turno do motorista.');
        }
      });
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