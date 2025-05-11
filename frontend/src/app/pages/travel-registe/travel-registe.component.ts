import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ViagemService } from '../../services/viagem.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-travel-registe',
  templateUrl: './travel-registe.component.html',
  styleUrls: ['./travel-registe.component.css']
})
export class TravelRegisteComponent implements OnInit {
  travelForm: FormGroup;
  viagem: any;

  constructor(
    private fb: FormBuilder,
    private viagemService: ViagemService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router
  ) {
    this.travelForm = this.fb.group({
      origem: [{ value: '', disabled: true }],
      destino: [{ value: '', disabled: true }],
      data: [{ value: '', disabled: true }],
      hora: [{ value: '', disabled: true }],
      passageiros: [{ value: '', disabled: true }]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.viagemService.getViagemById(id).subscribe({
        next: viagem => {
          console.log('Viagem recebida:', viagem);
          this.viagem = viagem;
          this.travelForm.patchValue({
            origem: this.formatarMorada(viagem.localInicio),
            destino: this.formatarMorada(viagem.localFim),
            data: viagem.inicio ? new Date(viagem.inicio).toISOString().substring(0, 10) : '',
            hora: viagem.inicio ? new Date(viagem.inicio).toTimeString().substring(0, 5) : '',
            passageiros: viagem.numeroPessoas
          });
        },
        error: () => {
          alert('Erro ao carregar dados da viagem.');
        }
      });
    }
  }

  onRegistarEntrada() {
    if (!this.viagem?._id) return;
    this.viagemService.registarEntradaPassageiros(this.viagem._id, { horaEntrada: new Date() }).subscribe({
      next: () => {
        alert('Entrada dos passageiros registada!');
        this.router.navigate(['/viagem/resumo', this.viagem._id]);
      },
      error: () => alert('Erro ao registar entrada dos passageiros.')
    });
  }

  formatarMorada(morada: any): string {
    if (!morada) return '';
    return `${morada.rua || ''} ${morada.numeroPorta || ''}, ${morada.codigoPostal || ''} ${morada.localidade || ''}`.trim();
  }

  voltarAtras(): void {
    this.location.back();
  }
}