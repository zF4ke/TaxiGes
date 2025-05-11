import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { TravelService } from 'src/app/services/travel.service';
import { TurnoService } from 'src/app/services/turno.service';

@Component({
  selector: 'app-travel-resume',
  templateUrl: './travel-resume.component.html',
  styleUrls: ['./travel-resume.component.css']
})
export class TravelResumeComponent implements OnInit {
  viagem: any;
  cliente: any;
  turno: any;

  mostrarFormularioFim = false;
  fimForm: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private travelService: TravelService,
    private turnoService: TurnoService,
  ) {
    this.fimForm = this.fb.group({
      moradaFim: ['', Validators.required],
      horaFim: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const nav = this.router.getCurrentNavigation();
  
    // usar api para obter os dados, get current id (http://localhost:4200/viagem/resumo/68211a2ae4ce8f1bf7bc0ef6)

    const id = this.router.url.split('/').pop();
    console.log('ID da viagem:', id);

    if (!id) {
      console.error('ID da viagem não encontrado na URL');
      return;
    }

    this.travelService.getViagem(id).subscribe(
      (data) => {
        this.viagem = data;
        
        const turnoId = this.viagem.turno;

        this.turnoService.getTurno(turnoId).subscribe(
          (turnoData) => {
            this.turno = turnoData;
            console.log('Dados do turno:', this.turno);
          },
          (error) => {
            console.error('Erro ao obter dados do turno:', error);
          }
        );



        console.log('Dados da viagem:', this.viagem);
      },
      (error) => {
        console.error('Erro ao obter dados da viagem:', error);
      }
    );
  }
  

  onSubmitFimViagem() {
    if (this.fimForm.invalid) return;
    const dadosFim = this.fimForm.value;
    alert('Fim da viagem registado!\n' + JSON.stringify(dadosFim, null, 2));
    this.mostrarFormularioFim = false;
  }
}
