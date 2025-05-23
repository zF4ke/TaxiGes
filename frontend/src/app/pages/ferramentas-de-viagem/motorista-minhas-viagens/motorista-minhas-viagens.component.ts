import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router'; 
import { Viagem } from 'src/app/models/viagem.model';
import { MotoristaLogado, MotoristaService } from 'src/app/services/motorista.service';
import { TravelService } from 'src/app/services/travel.service';

@Component({
  selector: 'app-motorista-minhas-viagens',
  templateUrl: './motorista-minhas-viagens.component.html',
  styleUrls: ['./motorista-minhas-viagens.component.css']
})
export class MotoristaMinhasViagensComponent implements OnInit {

  viagens: Viagem[] = [];
  isLoading = true;
  motoristaLogado: MotoristaLogado | null = null; 
  constructor(
    private travelService: TravelService,
    private motoristaService: MotoristaService,
    private snackBar: MatSnackBar,
    private router: Router 
  ) {}

  ngOnInit(): void {
    this.motoristaLogado = this.motoristaService.getMotoristaLogado(); 

    if (this.motoristaLogado && this.motoristaLogado._id) { 
      this.loadMinhasViagens(this.motoristaLogado._id); 
    } else {
      this.isLoading = false;
      this.snackBar.open('Nenhum motorista logado. Por favor, faça o login.', 'Fechar', { duration: 3000 });
      this.router.navigate(['/motorista-login']); 
    }
  }

  loadMinhasViagens(motoristaId: string): void { 
    this.isLoading = true;
    this.travelService.getViagensPorMotorista(motoristaId).subscribe({
      next: (dataDoBackend: Viagem[]) => {
        this.viagens = dataDoBackend;
        this.isLoading = false;
      },
      error: (erro) => {
        console.error('Ocorreu um erro ao carregar as viagens:', erro);
        this.snackBar.open('Não foi possível carregar as suas viagens. Por favor, tente mais tarde.', 'Fechar', { duration: 4000 });
        this.isLoading = false;
      }
    });
  }

  formatDate(dataIsoString: string | undefined): string {
    if (!dataIsoString) return 'N/D';
    const dataObj = new Date(dataIsoString);
    if (isNaN(dataObj.getTime())) return 'Data Inválida';
    return dataObj.toLocaleDateString('pt-PT', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  }
}