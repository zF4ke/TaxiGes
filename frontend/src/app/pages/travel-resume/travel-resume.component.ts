import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ViagemService } from 'src/app/services/viagem.service';

@Component({
  selector: 'app-travel-resume',
  templateUrl: './travel-resume.component.html',
  styleUrls: ['./travel-resume.component.css']
})
export class TravelResumeComponent implements OnInit {
  viagem: any;
  mostrarFormularioFim = false;
  fimForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private viagemService: ViagemService,
    private fb: FormBuilder
  ) {
    this.fimForm = this.fb.group({
      moradaFim: ['', Validators.required],
      horaFim: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.viagemService.getViagemById(id).subscribe({
        next: v => {
          this.viagem = v;
          // Preenche o formulário com dados da viagem, se necessário
          this.fimForm.patchValue({
            moradaFim: v.localFim?.rua || '',
            horaFim: v.fim ? new Date(v.fim).toISOString().substring(0, 16) : ''
          });
        },
        error: () => this.viagem = null
      });
    }
  }

  onSubmitFimViagem() {
    if (this.fimForm.invalid || !this.viagem?._id) return;
    const dadosFim = {
      ...this.fimForm.value,
      status: 'finalizada'
    };
    this.viagemService.atualizarViagem(this.viagem._id, dadosFim).subscribe({
      next: () => {
        alert('Fim da viagem registado!');
        window.location.href = '/'; 
      },
      error: () => alert('Erro ao registar fim da viagem.')
    });
  }
} 