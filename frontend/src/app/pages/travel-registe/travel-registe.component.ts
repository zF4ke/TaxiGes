import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-travel-registe',
  templateUrl: './travel-registe.component.html',
  styleUrls: ['./travel-registe.component.css']
})
export class TravelRegisteComponent implements OnInit {
  @Input() pedidoAceite: any; 
  travelForm: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder) {
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
    if (!this.pedidoAceite && history.state.pedidoAceite) {
        this.pedidoAceite = history.state.pedidoAceite;
    }
    if (this.pedidoAceite) {
        const agora = new Date();
        this.travelForm.patchValue({
            origem: this.pedidoAceite.moradaOrigem,
            destino: this.pedidoAceite.moradaDestino,
            data: agora.toISOString().substring(0, 10),
            hora: agora.toTimeString().substring(0, 5),
            passageiros: this.pedidoAceite.numeroPessoas || 1
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
}