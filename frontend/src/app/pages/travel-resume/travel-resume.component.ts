import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-travel-resume',
  templateUrl: './travel-resume.component.html',
  styleUrls: ['./travel-resume.component.css']
})
export class TravelResumeComponent implements OnInit {
  destino?: string;
  precoFinal?: number;
  kmPercorridos?: number;

  mostrarFormularioFim = false;
  fimForm: FormGroup;

  constructor(private router: Router, private fb: FormBuilder) {
    this.fimForm = this.fb.group({
      moradaFim: ['', Validators.required],
      horaFim: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state as { [key: string]: any } | undefined;
    this.destino = state?.['destino'];
    this.precoFinal = state?.['precoFinal'];
    this.kmPercorridos = state?.['kmPercorridos'];
  }

  // Quando o botão é clicado, preenche o formulário automaticamente
  ngAfterViewInit() {
    if (this.destino) {
      this.fimForm.patchValue({
        moradaFim: this.destino,
        horaFim: new Date().toISOString().substring(0, 16)
      });
    }
  }

  onSubmitFimViagem() {
    if (this.fimForm.invalid) return;
    const dadosFim = this.fimForm.value;
    // Aqui podes chamar o serviço para atualizar a viagem no backend
    alert('Fim da viagem registado!\n' + JSON.stringify(dadosFim, null, 2));
    this.mostrarFormularioFim = false;
  }
}