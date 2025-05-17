import { Component, OnInit } from '@angular/core';
import { TurnoService } from 'src/app/services/turno.service';
import { MotoristaService } from 'src/app/services/motorista.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-list-turnos',
  templateUrl: './list-turnos.component.html',
  styleUrls: ['./list-turnos.component.css']
})
export class ListTurnosComponent implements OnInit {
  turnos: any[] = [];
  isLoading = true;

  constructor(
    private turnoService: TurnoService,
    private motoristaService: MotoristaService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const motorista = this.motoristaService.getMotoristaLogado();
    if (!motorista) {
      this.snackBar.open('Erro: motorista não autenticado.', 'Fechar', { duration: 3000 });
      return;
    }

    this.turnoService.getTurnosByMotorista(motorista._id).subscribe({
      next: (turnos) => {
        this.turnos = turnos;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar turnos:', err);
        this.snackBar.open('Erro ao carregar turnos.', 'Fechar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }
}